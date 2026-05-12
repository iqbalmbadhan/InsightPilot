"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecommendedAction } from "@/types";

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: "red" | "amber" | "emerald"; description: string }
> = {
  immediate: {
    label: "Immediate",
    variant: "red",
    description: "Act now",
  },
  "this-week": {
    label: "This Week",
    variant: "amber",
    description: "Within 7 days",
  },
  "this-month": {
    label: "This Month",
    variant: "emerald",
    description: "Within 30 days",
  },
};

interface ActionCardProps {
  action: RecommendedAction;
  delay?: number;
}

export default function ActionCard({ action, delay = 0 }: ActionCardProps) {
  const config = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG["this-week"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="border-blue-900/40 bg-blue-950/10 hover:border-blue-800/50 transition-colors">
        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/40 border border-blue-700/40">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="font-mono text-xs font-semibold text-blue-300 uppercase tracking-wide">
                  Recommended Action
                </span>
              </div>
              <Badge variant={config.variant} className="gap-1 text-[11px]">
                <Clock className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            {/* Action text */}
            <p className="text-sm font-medium leading-relaxed text-zinc-100 pl-8">
              {action.text}
            </p>

            {/* Rationale */}
            <div className="pl-8 border-l-2 border-blue-900/50">
              <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                <span className="text-zinc-600">why → </span>
                {action.rationale}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
