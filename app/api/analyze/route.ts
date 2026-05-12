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
      signal: "Revenue concentration: Acme Corp = $113.2K, next largest customer GlobalTech = $42.6K",
      category: "revenue",
    },
    {
      id: 2,
      text: "Sarah J. closed $168K in revenue — 56% of total — while the South region generated only $10.3K across 8 deals with a 50% loss rate. Tom R. in South lost 4 deals citing competitor pricing, suggesting a structural pricing or positioning gap in that territory.",
      signal: "Rep performance gap: Sarah J = $168K (North), Tom R = $10.3K (South), 4/8 deals lost to competitors",
      category: "operations",
    },
    {
      id: 3,
      text: "Three deals totaling $21.2K remain in Pending/Awaiting status — TechStart Inc ($17.4K) and QuickBiz ($3.8K). TechStart has had a pending deal since January, suggesting a stalled sales cycle or procurement delay that could affect Q2 cash flow.",
      signal: "Pipeline: $21.2K stuck in Pending across 3 deals; TechStart pending since Jan 25",
      category: "customers",
    },
  ],
  risks: [
    {
      id: 1,
      text: "Acme Corp concentration means a single customer decision — contract non-renewal, budget cut, or competitor switch — could eliminate ~38% of revenue with no pipeline sufficient to absorb the impact within a quarter.",
      confidence: "high",
      impact: "high",
    },
    {
      id: 2,
      text: "South region has a 50% deal loss rate tied to price objections. If this pattern reflects a market-fit issue rather than a rep issue, continued investment in South without pricing adjustment will compound losses and waste sales capacity.",
      confidence: "medium",
      impact: "medium",
    },
  ],
  action: {
    text: "Immediately audit Acme Corp's account health: confirm contract renewal timeline, identify decision-makers, and assess any signals of competitive evaluation. In parallel, initiate a second-customer growth program to bring at least two customers to 15%+ revenue share within 90 days.",
    priority: "immediate",
    rationale: "Customer concentration at 38% is the single largest business risk in this dataset. A churn event here would be existential. The pending TechStart deals and South region decay are secondary — the concentration risk must be addressed first.",
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

    // Validate: must have some input
    if (!parsedData && !rawText?.trim()) {
      return NextResponse.json(
        { error: "No data provided. Upload a file or paste notes." },
        { status: 400 }
      );
    }

    // Demo mode — no API key configured
    if (process.env.DEMO_MODE === "true") {
      await new Promise((r) => setTimeout(r, 1200)); // simulate latency
      return NextResponse.json({ ...DEMO_RESULT, generatedAt: new Date().toISOString() });
    }

    const client = buildClient();

    if (!client) {
      // Graceful fallback: return demo result with a note
      return NextResponse.json({
        ...DEMO_RESULT,
        generatedAt: new Date().toISOString(),
        dataQualityNote:
          "⚠️ Running in demo mode — no OPENAI_API_KEY or OPENROUTER_API_KEY found. Add your API key to .env.local for real AI analysis. " +
          (DEMO_RESULT.dataQualityNote ?? ""),
      });
    }

    // Build prompt from serialized data (preferred) or re-serialize
    const ctx = serialized ?? serializeForPrompt(parsedData ?? null, rawText);

    const userPrompt = buildUserPrompt({
      dataType: ctx.dataType,
      summary: ctx.summary,
      dataPreview: ctx.dataPreview,
    });

    const model = resolveModel();

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    let parsed: Partial<AnalysisResult>;
    try {
      parsed = JSON.parse(raw) as Partial<AnalysisResult>;
    } catch {
      return NextResponse.json(
        { error: "AI response was not valid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Validate shape
    if (
      !Array.isArray(parsed.insights) ||
      parsed.insights.length !== 3 ||
      !Array.isArray(parsed.risks) ||
      parsed.risks.length !== 2 ||
      !parsed.action
    ) {
      return NextResponse.json(
        { error: "AI response did not match expected format. Please try again." },
        { status: 500 }
      );
    }

    const result: AnalysisResult = {
      insights: parsed.insights,
      risks: parsed.risks,
      action: parsed.action,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      dataQualityNote: parsed.dataQualityNote ?? null,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[InsightPilot API error]", err);

    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    // Surface OpenAI-specific errors cleanly
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Check your OPENAI_API_KEY in .env.local." },
        { status: 401 }
      );
    }
    if (message.includes("429") || message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit hit. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
