"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadMarkdown, exportToMarkdown } from "@/lib/exportMarkdown";
import type { AnalysisResult } from "@/types";

interface ExportButtonProps {
  result: AnalysisResult;
  fileName?: string;
}

export default function ExportButton({ result, fileName }: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    downloadMarkdown(result, fileName);
  };

  const handleCopy = async () => {
    const md = exportToMarkdown(result, fileName);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5 font-mono text-xs"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy MD
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-1.5 font-mono text-xs"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
    </div>
  );
}
