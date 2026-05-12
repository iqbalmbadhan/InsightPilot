import { BarChart2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <BarChart2 className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
      </div>
      <p className="font-mono text-sm font-medium text-zinc-500 dark:text-zinc-400">
        No analysis yet
      </p>
      <p className="mt-1.5 max-w-xs font-mono text-xs text-zinc-400 leading-relaxed dark:text-zinc-600">
        Upload a CSV/Excel file or paste business notes above, then click{" "}
        <span className="text-zinc-600 dark:text-zinc-400">Analyze</span> to
        generate insights.
      </p>
    </div>
  );
}
