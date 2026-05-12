"use client";

import { motion } from "framer-motion";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightCard from "@/components/InsightCard";
import RiskCard from "@/components/RiskCard";
import ActionCard from "@/components/ActionCard";
import ConfidenceScore from "@/components/ConfidenceScore";
import ExportButton from "@/components/ExportButton";
import type { AnalysisResult } from "@/types";

interface ResultsDashboardProps {
  result: AnalysisResult;
  fileName?: string;
  onReset: () => void;
}

export default function ResultsDashboard({
  result,
  fileName,
  onReset,
}: ResultsDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-mono text-sm font-bold text-zinc-700 uppercase tracking-wide dark:text-zinc-200">
            Analysis Complete
          </h2>
          <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
            {new Date(result.generatedAt).toLocaleString()}
            {fileName && ` · ${fileName}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton result={result} fileName={fileName} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 font-mono text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfidenceScore score={result.confidence} note={result.dataQualityNote} />

      {/* Insights section */}
      <SectionDivider label="Insights" />
      <div className="space-y-3">
        {result.insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={i} />
        ))}
      </div>

      {/* Risks section */}
      <SectionDivider label="Risks" />
      <div className="space-y-3">
        {result.risks.map((risk, i) => (
          <RiskCard key={risk.id} risk={risk} index={i} delay={0.3 + i * 0.08} />
        ))}
      </div>

      {/* Action section */}
      <SectionDivider label="Action" />
      <ActionCard action={result.action} delay={0.5} />

      {/* Data quality warning */}
      {result.dataQualityNote && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
          <p className="font-mono text-xs text-amber-700 leading-relaxed dark:text-amber-300/80">
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Data note:{" "}
            </span>
            {result.dataQualityNote}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest dark:text-zinc-600">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
