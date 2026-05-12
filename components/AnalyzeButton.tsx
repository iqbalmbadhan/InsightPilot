"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export default function AnalyzeButton({
  onClick,
  disabled,
  isLoading,
}: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      size="lg"
      className={cn(
        "w-full gap-2.5 font-mono text-sm font-semibold transition-all duration-200",
        "bg-emerald-600 hover:bg-emerald-500 text-white",
        "disabled:bg-zinc-800 disabled:text-zinc-500",
        "shadow-lg shadow-emerald-900/20",
        isLoading && "opacity-80"
      )}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Analyzing…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Analyze →
        </>
      )}
    </Button>
  );
}
