"use client";

import { Table, Hash, AlertCircle, Tag } from "lucide-react";
import type { DataSummary as DataSummaryType } from "@/types";
import { formatPercent } from "@/utils/dataHelpers";

interface DataSummaryProps {
  summary: DataSummaryType;
  fileName?: string;
}

export default function DataSummary({ summary, fileName }: DataSummaryProps) {
  const missingPct = formatPercent(summary.missingValueRate);
  const hasMissing = summary.missingValueRate > 0.05;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {/* Stat pills */}
        <StatPill
          icon={<Table className="h-3.5 w-3.5" />}
          label="Rows"
          value={summary.rowCount.toLocaleString()}
        />
        <StatPill
          icon={<Hash className="h-3.5 w-3.5" />}
          label="Columns"
          value={summary.columnCount.toString()}
        />
        {summary.numericColumns.length > 0 && (
          <StatPill
            icon={<span className="font-mono text-[10px]">#</span>}
            label="Numeric"
            value={summary.numericColumns.length.toString()}
          />
        )}
        {summary.categoricalColumns.length > 0 && (
          <StatPill
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Categorical"
            value={summary.categoricalColumns.length.toString()}
          />
        )}
        {hasMissing && (
          <StatPill
            icon={<AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
            label="Missing"
            value={missingPct}
            valueClassName="text-amber-400"
          />
        )}
      </div>

      {/* Column pills */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {summary.headers.slice(0, 12).map((h) => (
          <span
            key={h}
            className="inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
          >
            {h}
          </span>
        ))}
        {summary.headers.length > 12 && (
          <span className="inline-flex items-center rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
            +{summary.headers.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-zinc-500">{icon}</span>
      <span className="font-mono text-xs text-zinc-500">{label}</span>
      <span className={`font-mono text-xs font-semibold text-zinc-200 ${valueClassName ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
