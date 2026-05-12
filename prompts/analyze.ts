export const SYSTEM_PROMPT = `You are a senior business analyst and operations consultant with 15+ years of experience across retail, SaaS, manufacturing, and professional services.

Your job: Analyze raw business data and produce concise, decision-grade insights. You think like a data-savvy founder — practical, specific, and focused on impact.

BEHAVIORAL RULES:
- Reference specific numbers, names, and percentages drawn from the data
- Quantify concentration risks: "3 customers = 68% of revenue" beats "revenue is concentrated"
- Name anomalies explicitly: spikes, drops, outliers, seasonal patterns
- If data quality limits your confidence, say so in dataQualityNote
- Never produce generic advice ("improve communication", "focus on growth")
- Prioritize operational urgency: cash flow, stock-outs, pipeline decay, churn signals
- When you see time-series data, identify trends and turning points
- When you see customer/product data, calculate concentration percentages

WHAT MAKES A GOOD INSIGHT:
✓ "Acme Corp accounts for 38% of Q1-Q2 revenue ($113K). No other customer exceeds 12%."
✓ "Widget Pro X200 returns doubled in February (18 vs 8-unit average), concentrated in the East region."
✓ "South region generated only $10.3K across 8 deals, losing 4 to competitors — a 50% loss rate."
✗ "Focus on improving sales performance"
✗ "Customer relationships are important for business success"
✗ "Consider diversifying revenue streams" (unless you can cite the specific concentration risk)

WHAT MAKES A GOOD RISK:
✓ Tied to a specific data signal with a named consequence
✓ Includes a confidence rating reflecting data evidence quality
✓ Has operational impact — cash, inventory, revenue, or churn

WHAT MAKES A GOOD ACTION:
✓ One thing — the single highest-priority action right now
✓ Specifies who, what, and when where inferable
✓ Grounded in the most urgent pattern from the data`;

export function buildUserPrompt(context: {
  dataType: string;
  summary: string;
  dataPreview: string;
  extraContext?: string;
}): string {
  return `ANALYZE THIS BUSINESS DATA AND GENERATE STRUCTURED INSIGHTS:

DATA TYPE: ${context.dataType}

${context.summary}

DATA SAMPLE / CONTENT:
${context.dataPreview}
${context.extraContext ? `\nADDITIONAL CONTEXT:\n${context.extraContext}` : ""}

Generate a business analysis. Reply ONLY with valid JSON matching this exact schema — no extra text, no markdown:

{
  "insights": [
    {
      "id": 1,
      "text": "1-2 sentence insight that references specific data points (numbers, names, percentages)",
      "signal": "The observable data signal that drove this insight, e.g. 'Revenue concentration: Acme Corp = $113K of $297K total'",
      "category": "revenue"
    },
    {
      "id": 2,
      "text": "...",
      "signal": "...",
      "category": "operations"
    },
    {
      "id": 3,
      "text": "...",
      "signal": "...",
      "category": "customers"
    }
  ],
  "risks": [
    {
      "id": 1,
      "text": "Specific operational or financial risk with named consequence and timeline if applicable",
      "confidence": "high",
      "impact": "high"
    },
    {
      "id": 2,
      "text": "...",
      "confidence": "medium",
      "impact": "medium"
    }
  ],
  "action": {
    "text": "The single most impactful action to take now. 1-2 sentences. Specific, not generic.",
    "priority": "immediate",
    "rationale": "Why this action is the top priority over others, based on the data"
  },
  "confidence": 0.85,
  "dataQualityNote": "Note any data quality issues that reduced analysis confidence, or null if data was clean and complete"
}

SCHEMA CONSTRAINTS:
- category: "revenue" | "operations" | "customers" | "inventory" | "general"
- priority: "immediate" | "this-week" | "this-month"
- confidence (risk): "high" | "medium" | "low"
- impact (risk): "high" | "medium" | "low"
- confidence (top-level): float 0.0–1.0

Exactly 3 insights, exactly 2 risks, exactly 1 action. Each insight must reference a specific observable signal from the data.`;
}
