"use client";

import Papa from "papaparse";
import type { ParsedData, DataSummary } from "@/types";
import {
  inferColumnType,
  computeColumnStats,
  getTopValues,
  estimateMissingRate,
} from "@/utils/dataHelpers";

export async function parseCSVFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(
            new Error("Failed to parse CSV: " + results.errors[0].message)
          );
          return;
        }

        const rows = results.data as Record<string, unknown>[];
        const headers = results.meta.fields ?? [];
        const summary = buildSummary(rows, headers);

        resolve({ type: "csv", headers, rows, summary, fileName: file.name });
      },
      error: (err) =>
        reject(new Error("CSV parse error: " + err.message)),
    });
  });
}

export async function parseXLSXFile(file: File): Promise<ParsedData> {
  const XLSX = await import("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file");

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          { defval: "", raw: false }
        );

        if (jsonData.length === 0) {
          reject(new Error("No data found in spreadsheet"));
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const summary = buildSummary(jsonData, headers);

        resolve({
          type: "xlsx",
          headers,
          rows: jsonData,
          summary,
          fileName: file.name,
        });
      } catch (err) {
        reject(
          new Error(
            "Failed to parse Excel file: " +
              (err instanceof Error ? err.message : "Unknown error")
          )
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function buildSummary(
  rows: Record<string, unknown>[],
  headers: string[]
): DataSummary {
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const numericStats: Record<
    string,
    { min: number; max: number; mean: number; sum: number }
  > = {};
  const topValues: Record<string, string[]> = {};

  headers.forEach((header) => {
    const values = rows.map((r) => r[header]);
    const type = inferColumnType(values);

    if (type === "numeric") {
      numericColumns.push(header);
      const stats = computeColumnStats(values);
      if (stats) numericStats[header] = stats;
    } else if (type !== "date") {
      categoricalColumns.push(header);
      topValues[header] = getTopValues(values);
    }
  });

  return {
    rowCount: rows.length,
    columnCount: headers.length,
    headers,
    missingValueRate: estimateMissingRate(rows, headers),
    numericColumns,
    categoricalColumns,
    sampleRows: rows.slice(0, 5),
    numericStats,
    topValues,
  };
}

export function serializeForPrompt(
  parsedData: ParsedData | null,
  rawText: string
): { summary: string; dataPreview: string; dataType: string } {
  if (!parsedData || parsedData.type === "text") {
    return {
      dataType: "Unstructured text / business notes",
      summary: `Text length: ${rawText.length} characters`,
      dataPreview: rawText.slice(0, 3000),
    };
  }

  const { summary, rows = [], headers = [], type, fileName } = parsedData;

  if (!summary) {
    return {
      dataType: type.toUpperCase(),
      summary: "No summary available",
      dataPreview: rawText,
    };
  }

  let summaryText = `FILE: ${fileName ?? "Unnamed"} (${type.toUpperCase()})\n`;
  summaryText += `SHAPE: ${summary.rowCount} rows × ${summary.columnCount} columns\n`;
  summaryText += `COLUMNS: ${headers.join(", ")}\n`;
  summaryText += `MISSING DATA: ${(summary.missingValueRate * 100).toFixed(1)}%\n`;

  if (Object.keys(summary.numericStats ?? {}).length > 0) {
    summaryText += `\nNUMERIC COLUMN STATISTICS:\n`;
    Object.entries(summary.numericStats ?? {}).forEach(([col, stats]) => {
      summaryText += `  ${col}: min=${stats.min.toFixed(2)}, max=${stats.max.toFixed(2)}, mean=${stats.mean.toFixed(2)}, total=${stats.sum.toFixed(2)}\n`;
    });
  }

  if (Object.keys(summary.topValues ?? {}).length > 0) {
    summaryText += `\nCATEGORICAL DISTRIBUTIONS (top values):\n`;
    Object.entries(summary.topValues ?? {})
      .slice(0, 6)
      .forEach(([col, values]) => {
        summaryText += `  ${col}: ${values.join(", ")}\n`;
      });
  }

  const sampleRows = rows.slice(0, 20);
  let preview = `SAMPLE DATA (first ${sampleRows.length} rows):\n`;
  preview += headers.join("\t") + "\n";
  sampleRows.forEach((row) => {
    preview += headers.map((h) => String(row[h] ?? "")).join("\t") + "\n";
  });

  return {
    dataType: `${type.toUpperCase()} — ${fileName ?? "Unnamed"}`,
    summary: summaryText,
    dataPreview: preview,
  };
}
