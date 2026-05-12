"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseCSVFile, parseXLSXFile } from "@/lib/parseData";
import type { ParsedData } from "@/types";

interface FileUploadProps {
  onParsed: (data: ParsedData) => void;
  onError: (msg: string) => void;
  parsed: ParsedData | null;
  onClear: () => void;
  onLoadExample: () => void;
}

const ACCEPTED_TYPES = [".csv", ".xlsx", ".xls"];

export default function FileUpload({
  onParsed,
  onError,
  parsed,
  onClear,
  onLoadExample,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      onError("");
      try {
        const name = file.name.toLowerCase();
        let result: ParsedData;

        if (name.endsWith(".csv")) {
          result = await parseCSVFile(file);
        } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
          result = await parseXLSXFile(file);
        } else {
          throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
        }

        onParsed(result);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to parse file");
      } finally {
        setIsParsing(false);
      }
    },
    [onParsed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (parsed) {
    const icon =
      parsed.type === "xlsx" ? (
        <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
      ) : (
        <FileText className="h-4 w-4 text-emerald-400" />
      );

    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-800/50 bg-emerald-900/10 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-zinc-200">
              {parsed.fileName}
            </p>
            <p className="font-mono text-xs text-zinc-500">
              {parsed.summary?.rowCount} rows · {parsed.summary?.columnCount} columns
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="ml-3 shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900",
          isParsing && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {isParsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
            <p className="font-mono text-xs text-zinc-400">Parsing file…</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
              <Upload className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="font-mono text-sm font-medium text-zinc-300">
              Drop CSV / Excel here
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              or click to browse
            </p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600">
              .csv · .xlsx · .xls
            </p>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onLoadExample}
        className="w-full font-mono text-xs text-zinc-500 hover:text-zinc-300"
      >
        Load example sales CSV
      </Button>
    </div>
  );
}
