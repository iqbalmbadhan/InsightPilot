export function inferColumnType(
  values: unknown[]
): "numeric" | "date" | "categorical" | "mixed" {
  const nonNull = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );
  if (nonNull.length === 0) return "categorical";

  const numericCount = nonNull.filter((v) => {
    const cleaned = String(v).replace(/[$,%\s,]/g, "");
    return !isNaN(Number(cleaned)) && cleaned !== "";
  }).length;

  const datePatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
    /^\d{4}-\d{2}-\d{2}/,
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s]\d/i,
    /^\d{1,2}-[A-Za-z]{3}-\d{4}/,
  ];
  const dateCount = nonNull.filter((v) =>
    datePatterns.some((p) => p.test(String(v).trim()))
  ).length;

  if (numericCount / nonNull.length > 0.7) return "numeric";
  if (dateCount / nonNull.length > 0.5) return "date";
  return "categorical";
}

export function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[$,%\s,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function computeColumnStats(
  values: unknown[]
): { min: number; max: number; mean: number; sum: number } | null {
  const nums = values
    .map(parseNumericValue)
    .filter((n): n is number => n !== null);
  if (nums.length === 0) return null;

  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...nums),
    max: Math.max(...nums),
    mean: sum / nums.length,
    sum,
  };
}

export function getTopValues(values: unknown[], limit = 5): string[] {
  const counts: Record<string, number> = {};
  values.forEach((v) => {
    const key = String(v ?? "").trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([val]) => val);
}

export function estimateMissingRate(
  rows: Record<string, unknown>[],
  headers: string[]
): number {
  if (rows.length === 0 || headers.length === 0) return 0;

  let missing = 0;
  const total = rows.length * headers.length;

  rows.forEach((row) => {
    headers.forEach((h) => {
      const val = row[h];
      if (val === null || val === undefined || val === "") missing++;
    });
  });

  return missing / total;
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
