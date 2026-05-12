import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/prompts/analyze";
import type { AnalysisResult, AnalyzeRequest } from "@/types";
import { serializeForPrompt } from "@/lib/parseData";

// ─── Demo mode response ───────────────────────────────────────────────────────

const DEMO_RESULT: AnalysisResult = {
  insights: [
    {
      id: 1,
      text: "Acme Corp represents approximately 38% of total revenue ($113.2K of $297.4K) across the observed period, with no other customer exceeding 12% share. Revenue growth from this account (+130% Jan→Apr) masks underlying diversification risk.",
      signal:
        "Revenue concentration: Acme Corp = $113.2K, next largest GlobalTech = $42.6K (14%)",
      category: "revenue",
    },
    {
      id: 2,
      text: "Sarah J. closed $168K in revenue — 56% of total — while the South region generated only $10.3K across 8 deals with a 50% loss rate. Tom R. in South lost 4 deals citing competitor pricing, suggesting a structural pricing or positioning gap in that territory.",
      signal:
        "Rep performance gap: Sarah J = $168K (North), Tom R = $10.3K (South), 4/8 deals lost",
      category: "operations",
    },
    {
      id: 3,
      text: "Three deals totaling $21.2K remain Pending — TechStart Inc ($17.4K across 3 deals) and QuickBiz ($3.8K). TechStart has had a deal pending since January 25, indicating a stalled sales cycle or procurement delay that could affect cash flow.",
      signal:
        "Pipeline: $21.2K stuck in Pending; TechStart has been pending since Jan 25 (3+ months)",
      category: "customers",
    },
  ],
  risks: [
    {
      id: 1,
      text: "Acme Corp concentration means a single decision — contract non-renewal, budget cut, or competitor switch — could eliminate ~38% of revenue with no pipeline large enough to absorb the impact within a quarter.",
      confidence: "high",
      impact: "high",
    },
    {
      id: 2,
      text: "South region has a 50% deal loss rate driven by price objections. If this reflects a market-fit issue rather than a rep issue, continued investment there without pricing adjustment will compound losses.",
      confidence: "medium",
      impact: "medium",
    },
  ],
  action: {
    text: "Immediately audit Acme Corp's account health: confirm renewal timeline, identify decision-makers, and watch for competitive evaluation signals. In parallel, start a second-customer growth initiative to bring at least two accounts to 15%+ revenue share within 90 days.",
    priority: "immediate",
    rationale:
      "Customer concentration at 38% is the single largest business risk in this dataset. A churn event here would be existential. South region decay and pending pipeline are secondary priorities.",
  },
  confidence: 0.81,
  dataQualityNote:
    "3 rows had missing customer names. Some amounts lacked $ prefix. Date formats were inconsistent (MM/DD/YYYY, YYYY-MM-DD, Jan-DD). Analysis proceeded with available data; figures are directionally accurate.",
  generatedAt: new Date().toISOString(),
};

// ─── OpenAI / OpenRouter client factory ──────────────────────────────────────

function buildClient(): OpenAI | null {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://insightpilot.app",
        "X-Title": "InsightPilot",
      },
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return null;
}

function resolveModel(): string {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  }
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest & {
      serialized?: { dataType: string; summary: string; dataPreview: string };
    };

    const { parsedData, rawText = "", serialized } = body;

    if (!parsedData && !rawText?.trim()) {
      return NextResponse.json(
        { error: "No data provided. Upload a file or paste notes." },
        { status: 400 }
      );
    }

    // Demo mode
    if (process.env.DEMO_MODE === "true") {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json({
        ...DEMO_RESULT,
        generatedAt: new Date().toISOString(),
      });
    }

    const client = buildClient();

    if (!client) {
      return NextResponse.json({
        ...DEMO_RESULT,
        generatedAt: new Date().toISOString(),
        dataQualityNote:
          "⚠️ Demo mode — no OPENAI_API_KEY or OPENROUTER_API_KEY found in environment. Add your key to .env.local for real AI analysis. " +
          (DEMO_RESULT.dataQualityNote ?? ""),
      });
    }

    const ctx = serialized ?? serializeForPrompt(parsedData ?? null, rawText);

    const userPrompt = buildUserPrompt({
      dataType: ctx.dataType,
      summary: ctx.summary,
      dataPreview: ctx.dataPreview,
    });

    const model = resolveModel();

    // Some free models don't honour response_format — try without it first,
    // fall back gracefully. Reasoning models also need <think> stripped.
    const isReasoningModel =
      model.includes("reasoning") ||
      model.includes("deepseek-r") ||
      model.includes("o1") ||
      model.includes("o3") ||
      model.includes("thinking");

    const createParams: Parameters<typeof client.chat.completions.create>[0] =
      {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: isReasoningModel ? 1 : 0.25, // reasoning models require temp=1
        max_tokens: 2000,
      };

    // Only request json_object mode for non-reasoning models; many free/reasoning
    // models on OpenRouter either ignore or error on this parameter
    if (!isReasoningModel) {
      createParams.response_format = { type: "json_object" };
    }

    const completion = await client.chat.completions.create({
      ...createParams,
      stream: false,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent.trim()) {
      return NextResponse.json(
        {
          error:
            `Model "${model}" returned an empty response. ` +
            `This model may not support structured output. ` +
            `Try: meta-llama/llama-3.1-8b-instruct:free or google/gemini-2.0-flash-exp:free`,
        },
        { status: 500 }
      );
    }

    // Robustly extract JSON from the response:
    // 1. Strip <think>…</think> blocks (DeepSeek R1, Nemotron, QwQ, etc.)
    // 2. Strip markdown code fences  ```json … ```
    // 3. Extract the first {...} JSON object if still not parseable
    const extractJSON = (text: string): string => {
      let s = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      s = s.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
      if (!s.startsWith("{")) {
        const match = s.match(/\{[\s\S]*\}/);
        if (match) s = match[0];
      }
      return s;
    };

    const cleaned = extractJSON(rawContent);

    let parsed: Partial<AnalysisResult>;
    try {
      parsed = JSON.parse(cleaned) as Partial<AnalysisResult>;
    } catch {
      console.error("[InsightPilot] Could not parse AI response:", rawContent.slice(0, 500));
      return NextResponse.json(
        {
          error:
            `Model "${model}" did not return valid JSON. ` +
            `Try a model with better instruction-following: ` +
            `meta-llama/llama-3.1-8b-instruct:free or google/gemini-2.0-flash-exp:free`,
        },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(parsed.insights) ||
      parsed.insights.length !== 3 ||
      !Array.isArray(parsed.risks) ||
      parsed.risks.length !== 2 ||
      !parsed.action
    ) {
      return NextResponse.json(
        {
          error:
            "AI response was missing required fields (need 3 insights, 2 risks, 1 action). " +
            "Try a stronger model: meta-llama/llama-3.3-70b-instruct:free",
        },
        { status: 500 }
      );
    }

    const result: AnalysisResult = {
      insights: parsed.insights,
      risks: parsed.risks,
      action: parsed.action,
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      dataQualityNote: parsed.dataQualityNote ?? null,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[InsightPilot API error]", err);

    // OpenAI SDK wraps HTTP errors as APIError
    if (err instanceof OpenAI.APIError) {
      const model = resolveModel();

      if (err.status === 400) {
        // Most common cause: invalid model ID (especially with OpenRouter)
        const isModelError =
          err.message.includes("model") ||
          err.message.includes("valid") ||
          err.message.includes("not found") ||
          err.message.includes("does not exist");

        if (isModelError) {
          return NextResponse.json(
            {
              error:
                `Invalid model ID: "${model}". ` +
                `OpenRouter model IDs use the format provider/model-name, e.g. ` +
                `"openai/gpt-4o-mini", "meta-llama/llama-3.1-8b-instruct:free", ` +
                `"google/gemma-3-4b-it:free". ` +
                `Check OPENROUTER_MODEL in your .env.local.`,
            },
            { status: 400 }
          );
        }
        return NextResponse.json({ error: err.message }, { status: 400 });
      }

      if (err.status === 401) {
        return NextResponse.json(
          {
            error:
              "Invalid API key. Check your OPENAI_API_KEY or OPENROUTER_API_KEY in .env.local.",
          },
          { status: 401 }
        );
      }

      if (err.status === 429) {
        return NextResponse.json(
          { error: "Rate limit hit. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      if (err.status === 402) {
        return NextResponse.json(
          {
            error:
              "Insufficient credits. Add credits to your OpenRouter/OpenAI account, or switch to a free model (e.g. OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free).",
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: `API error ${err.status}: ${err.message}` },
        { status: err.status ?? 500 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
