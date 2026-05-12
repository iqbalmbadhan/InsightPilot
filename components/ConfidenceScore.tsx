"use client";

import { Info } from "lucide-react";

interface ConfidenceScoreProps {
  score: number;
  note?: string | null;
}

export default function ConfidenceScore({ score, note }: ConfidenceScoreProps) {
  const pct = Math.round(score * 100);
  const barWidth = `${pct}%`;

  const color =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  const textColor =
    pct >= 75
      ? "text-emerald-700 dark:text-emerald-400"
      : pct >= 50
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-500">
            Analysis confidence
          </span>
          <span className={`font-mono text-xs font-bold ${textColor}`}>
            {pct}%
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {note && (
        <div className="group relative shrink-0">
          <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 cursor-help transition-colors" />
          <div className="absolute right-0 top-6 z-10 hidden w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl group-hover:block dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-mono text-[11px] text-zinc-600 leading-relaxed dark:text-zinc-400">
              {note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
