"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, X } from "lucide-react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import NotesInput from "@/components/NotesInput";
import DataSummary from "@/components/DataSummary";
import AnalyzeButton from "@/components/AnalyzeButton";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ResultsDashboard from "@/components/ResultsDashboard";
import { parseCSVFile } from "@/lib/parseData";
import { saveSession, loadSession } from "@/lib/storage";
import { serializeForPrompt } from "@/lib/parseData";
import type { ParsedData, AnalysisResult } from "@/types";

// ─── Example data ─────────────────────────────────────────────────────────────

const EXAMPLE_NOTES = `Q2 Sales Review — Internal Notes (messy draft)

Revenue down ~12% vs Q1. Main drop in East region.
Sarah J still top performer — closed 8 deals, $47K total.
Tom R struggling in South — 4 lost deals this quarter, all on price.

Inventory issues:
- Basic Handle Kit critically low (40 units, need 200/month)
- Widget Pro X200 returns spiked Feb (18 units returned vs 8 avg)
- Premium Case A1 overstock — 210 units sitting, only 50/mo velocity

Customer notes:
- Acme Corp: Big Q1, still our #1. Sarah worried they're shopping competitors
- TechStart: 3 deals pending, all stuck in legal review (2+ weeks)
- MegaCorp: 3 straight lost deals. Price sensitivity cited every time.
- NewCo signed for Basic Plan — small but potential to upsell

Cash flow:
- AR outstanding: $34K (60+ days overdue from RetailMax)
- Next big order due June 15 — need inventory sorted before then

Next steps from the meeting:
- Follow up Acme Corp before end of month
- Reorder Basic Handle Kit ASAP
- Tom R coaching — consider reassigning MegaCorp account
- Check warranty on Widget Pro X200 — possible defect batch`;

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cached session on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.result) {
      setResult(session.result);
    }
  }, []);

  const canAnalyze = (parsedData !== null || rawText.trim().length > 20) && !isAnalyzing;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const serialized = serializeForPrompt(parsedData, rawText);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedData,
          rawText,
          serialized,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ?? `Request failed (${response.status})`
        );
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
      saveSession(data, parsedData?.summary, parsedData?.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [canAnalyze, parsedData, rawText]);

  const handleReset = () => {
    setResult(null);
    setParsedData(null);
    setRawText("");
    setError(null);
  };

  const handleLoadExampleCSV = useCallback(async () => {
    try {
      const res = await fetch("/sample-data.csv");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const file = new File([blob], "sample-sales-data.csv", { type: "text/csv" });
      const parsed = await parseCSVFile(file);
      setParsedData(parsed);
      setRawText("");
      setError(null);
    } catch {
      setError("Failed to load example CSV");
    }
  }, []);

  const handleLoadExampleNotes = () => {
    setRawText(EXAMPLE_NOTES);
    setParsedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Hero text */}
        <div className="mb-8 space-y-1">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            A tiny AI analyst for messy operations.
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Upload a CSV / Excel file or paste notes → get 3 insights, 2 risks, 1 action.
          </p>
        </div>

        {/* Input section — only shown when no result */}
        {!result && (
          <div className="space-y-5">
            {/* Two-column input */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* File upload */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Upload File
                </label>
                <FileUpload
                  onParsed={(data) => {
                    setParsedData(data);
                    setError(null);
                  }}
                  onError={setError}
                  parsed={parsedData}
                  onClear={() => setParsedData(null)}
                  onLoadExample={handleLoadExampleCSV}
                />
              </div>

              {/* Text paste */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Paste Notes
                </label>
                <NotesInput
                  value={rawText}
                  onChange={setRawText}
                  onLoadExample={handleLoadExampleNotes}
                />
              </div>
            </div>

            {/* Data summary strip */}
            {parsedData?.summary && (
              <DataSummary
                summary={parsedData.summary}
                fileName={parsedData.fileName}
              />
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-900/40 bg-red-900/10 px-3.5 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="flex-1 font-mono text-xs text-red-300 leading-relaxed">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Analyze button */}
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              isLoading={isAnalyzing}
            />

            {/* Hint */}
            {!parsedData && !rawText && (
              <p className="text-center font-mono text-[11px] text-zinc-600">
                No API key? The app runs in demo mode with a sample response.
              </p>
            )}
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && <LoadingState />}

        {/* Results */}
        {!isAnalyzing && result && (
          <ResultsDashboard
            result={result}
            fileName={parsedData?.fileName}
            onReset={handleReset}
          />
        )}

        {/* Empty state — shown when no result, not loading, not inputting */}
        {!isAnalyzing && !result && !parsedData && !rawText && (
          <div className="mt-8">
            <EmptyState />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-900 py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-center font-mono text-[11px] text-zinc-700">
            InsightPilot · AI-powered business intelligence · Data never leaves your browser except for AI analysis
          </p>
        </div>
      </footer>
    </div>
  );
}
