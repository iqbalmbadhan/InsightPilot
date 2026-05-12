"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Risk } from "@/types";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-400 dark:bg-zinc-500",
};

const IMPACT_VARIANT: Record<string, "red" | "amber" | "default"> = {
  high: "red",
  medium: "amber",
  low: "default",
};

interface RiskCardProps {
  risk: Risk;
  index: number;
  delay?: number;
}

export default function RiskCard({ risk, index, delay = 0 }: RiskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="border-amber-200 hover:border-amber-300 transition-colors dark:border-amber-900/30 dark:hover:border-amber-800/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-900/30">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              {/* Risk text */}
              <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {risk.text}
              </p>

              {/* Confidence + Impact indicators */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${CONFIDENCE_COLORS[risk.confidence] ?? "bg-zinc-400"}`}
                  />
                  <span className="font-mono text-[11px] text-zinc-500">
                    {risk.confidence} confidence
                  </span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <Badge
                  variant={IMPACT_VARIANT[risk.impact] ?? "default"}
                  className="text-[10px] px-1.5 py-0.5"
                >
                  {risk.impact} impact
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
