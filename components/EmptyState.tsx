import { BarChart2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
        <BarChart2 className="h-6 w-6 text-zinc-600" />
      </div>
      <p className="font-mono text-sm font-medium text-zinc-400">
        No analysis yet
      </p>
      <p className="mt-1.5 max-w-xs font-mono text-xs text-zinc-600 leading-relaxed">
        Upload a CSV/Excel file or paste business notes above, then click{" "}
        <span className="text-zinc-400">Analyze</span> to generate insights.
      </p>
    </div>
  );
}
