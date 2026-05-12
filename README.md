# InsightPilot

> A tiny AI analyst for messy business operations.

Upload a messy CSV/Excel file or paste business notes — get 3 targeted insights, 2 risks, and 1 recommended action in seconds.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=flat-square&logo=tailwindcss)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?style=flat-square&logo=openai)

---

## Features

- **Dual input modes** — Upload CSV/XLSX or paste raw text (meeting notes, CRM exports, financial snippets)
- **Smart parsing** — Auto-detects column types, handles inconsistent formatting, estimates missing values
- **AI business analysis** — Produces exactly 3 insights, 2 risks, and 1 prioritized action
- **Evidence-based output** — Every insight cites the specific data signal that produced it
- **Confidence scoring** — Reflects both AI certainty and data quality
- **Demo mode** — Works immediately without an API key (returns a realistic canned response)
- **Export** — Download results as Markdown or copy to clipboard
- **Dark mode** — Default dark theme with light mode toggle
- **Local caching** — Results cached in localStorage for 24 hours

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS + shadcn/ui primitives |
| AI | OpenAI SDK (GPT-4o-mini by default) |
| CSV parsing | PapaParse |
| Excel parsing | SheetJS (xlsx) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theming | next-themes |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/iqbalmbadhan/insightpilot
cd insightpilot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Option A: OpenAI
OPENAI_API_KEY=sk-...

# Option B: OpenRouter (200+ models)
# OPENROUTER_API_KEY=sk-or-...

# Optional: use a different model
# OPENAI_MODEL=gpt-4o
```

> **No API key?** The app runs in demo mode and returns a realistic mock analysis. Perfect for UI exploration.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Generate sample Excel files (optional)

```bash
npm run generate-sample
```

Creates `public/sample-sales.xlsx` and `public/sample-inventory.xlsx` for testing.

---

## Usage

### CSV / Excel Upload
1. Click the upload area or drag-and-drop a `.csv`, `.xlsx`, or `.xls` file
2. The data summary strip shows row/column counts and detected column types
3. Click **Analyze →**

### Paste Notes
1. Paste raw text in the right panel (meeting notes, CRM exports, financial data, anything)
2. Click **Analyze →**

### Both
You can load a file AND paste notes — the AI will consider both.

### Example data
- Click **Load example sales CSV** to load a 34-row sales dataset with messy formatting
- Click **Load example notes** to load realistic business notes with multiple operational signals

---

## Architecture

```
/app
  page.tsx              — Main client component (state, orchestration)
  layout.tsx            — Root layout with ThemeProvider
  globals.css           — CSS variables + Tailwind base
  api/
    analyze/
      route.ts          — POST /api/analyze — calls OpenAI, validates response

/components
  ui/                   — Reusable primitives (Button, Card, Badge, Textarea)
  Header.tsx            — Sticky header with logo + dark mode toggle
  FileUpload.tsx        — Drag-and-drop file input with parse feedback
  NotesInput.tsx        — Textarea with char counter + example loader
  DataSummary.tsx       — Row/column/missing stats after file parse
  AnalyzeButton.tsx     — CTA with loading state
  LoadingState.tsx      — Animated loading with cycling AI messages
  EmptyState.tsx        — Empty results placeholder
  ResultsDashboard.tsx  — Wraps all result cards + export controls
  InsightCard.tsx       — Single insight with category badge + signal indicator
  RiskCard.tsx          — Single risk with confidence dot + impact badge
  ActionCard.tsx        — Recommended action with priority + rationale
  ConfidenceScore.tsx   — Animated confidence bar with data quality tooltip
  ExportButton.tsx      — Copy MD / Download MD

/lib
  parseData.ts          — CSV (PapaParse) + XLSX (SheetJS) parsers + data serializer
  storage.ts            — localStorage session cache (24h TTL)
  exportMarkdown.ts     — Converts AnalysisResult to Markdown string
  utils.ts              — cn() Tailwind class merger

/prompts
  analyze.ts            — System prompt + user prompt builder (the core product)

/types
  index.ts              — TypeScript interfaces (ParsedData, AnalysisResult, etc.)

/utils
  dataHelpers.ts        — Column type inference, numeric stats, top values

/public
  sample-data.csv       — 34-row sales dataset (messy formatting, customer concentration)
  sample-inventory.csv  — 18-row inventory dataset (stockout, return spike signals)

/scripts
  generate-sample-xlsx.js — Node.js script to generate .xlsx versions
```

---

## AI Approach

### Model choice
Default: `gpt-4o-mini` — fast, cheap, and sufficient for structured business analysis. Upgrade to `gpt-4o` for deeper reasoning on complex datasets.

### Prompt engineering

The system prompt engineers the model to behave like a **senior business analyst**, not a chatbot. Key techniques:

**1. Role specificity**

The model is told it has 15+ years across retail, SaaS, manufacturing, and professional services — this anchors vocabulary and framing to business operations rather than general knowledge.

**2. Explicit anti-patterns with examples**

```
NEVER produce generic advice:
  x "Customer relationships are important for business success"
  OK "Acme Corp accounts for 38% of Q1-Q2 revenue ($113K). No other customer exceeds 12%."
```

Showing bad examples is more effective than just prohibiting them.

**3. Forced evidence binding**

Every insight must include a `signal` field — the specific observable pattern that produced it. This forces the model to ground its output in data, not generic knowledge.

**4. Structured JSON output**

Using `response_format: { type: "json_object" }` with explicit field constraints eliminates markdown wrapping, field hallucination, and output variability.

**5. Low temperature**

`temperature: 0.25` keeps output deterministic and business-focused rather than creative.

**6. Data serialization strategy**

Rather than sending raw CSV, the prompt receives:
- Dataset shape (rows x cols, file name, format)
- Numeric column statistics (min, max, mean, sum per column)
- Categorical column distributions (top values by frequency)
- First 20 rows as tab-separated data

This fits complex datasets within token limits while preserving the signals the model needs most.

---

## Data Parsing

### CSV
PapaParse handles auto-detection of delimiters, mixed date formats, dollar signs and commas in numeric fields (`$12,400` → `12400`), and empty rows.

### XLSX / XLS
SheetJS reads binary ArrayBuffer in the browser, converts to JSON with `defval: ""` to preserve empty cells.

### Column type inference
Each column is classified as `numeric | date | categorical | mixed` based on:
- Percentage of values parseable as numbers after stripping `$`, `%`, spaces, commas
- Regex matching against 4 date patterns
- Default: categorical

This classification drives numeric stats computation and categorical top-value extraction.

### Missing value detection
Missing rate = (null + undefined + empty string cells) / (rows x columns).
Rates above 5% surface a warning in the DataSummary and flow into `dataQualityNote`.

---

## Validation Strategy

The API route validates at every layer:

1. **Input** — Rejects requests with no data
2. **API key** — Falls back to demo mode gracefully if no key is configured
3. **JSON parse** — Catches malformed AI responses with a descriptive error
4. **Schema shape** — Verifies exactly 3 insights, 2 risks, 1 action before returning
5. **Error surfacing** — OpenAI key errors, rate limits, and network failures produce user-readable messages, not stack traces

The client-side `canAnalyze` guard prevents submission unless a file has been parsed OR notes contain more than 20 characters, and no request is currently in-flight.

---

## Limitations

- **Context window**: Large files (1000+ rows) are truncated to first 20 rows for the AI prompt. The statistical summary compensates, but the model cannot see every individual row.
- **No persistent storage**: Results live in localStorage (24h TTL). No database, no accounts.
- **Single sheet**: XLSX parsing reads only the first worksheet.
- **Language**: English-language data and notes only.
- **Hallucination risk**: On very sparse or ambiguous data, the AI may produce lower-confidence insights. The `dataQualityNote` field and confidence score surface this.

---

## Future Improvements

- [ ] Recharts: auto-generate revenue trend / top customer bar charts from structured data
- [ ] Multi-sheet XLSX support with sheet selector
- [ ] Streaming AI responses (show insights as they arrive)
- [ ] Historical session gallery (view past analyses)
- [ ] Custom prompt tuning (user-configurable focus: inventory / revenue / customers)
- [ ] PDF export
- [ ] File comparison mode (upload two periods, detect changes)

---

## Sample Data Details

### `sample-data.csv` — Sales dataset (34 rows, 9 columns)
Intentional messiness: mixed date formats, missing customer names (3 rows), inconsistent amount formatting.
Key signals: Acme Corp concentration (~38%), Sarah J. top performer, South region 50% deal loss rate.

### `sample-inventory.csv` — Inventory dataset (18 rows, 10 columns)
Key signals: Basic Handle Kit stockout in May (after 3 months of warning signals), Widget Pro X200 return spike in February, Premium Case A1 return rate accelerating.

---

## License

MIT
