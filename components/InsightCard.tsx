"use client";

import { motion } from "framer-motion";
import { TrendingUp, Settings, Users, Package, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Insight } from "@/types";

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    variant: "emerald" | "blue" | "violet" | "amber" | "default";
    icon: React.ReactNode;
  }
> = {
  revenue: {
    label: "Revenue",
    variant: "emerald",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
  operations: {
    label: "Operations",
    variant: "blue",
    icon: <Settings className="h-3.5 w-3.5" />,
  },
  customers: {
    label: "Customers",
    variant: "violet",
    icon: <Users className="h-3.5 w-3.5" />,
  },
  inventory: {
    label: "Inventory",
    variant: "amber",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  general: {
    label: "General",
    variant: "default",
    icon: <BarChart2 className="h-3.5 w-3.5" />,
  },
};

interface InsightCardProps {
  insight: Insight;
  index: number;
}

export default function InsightCard({ insight, index }: InsightCardProps) {
  const config = CATEGORY_CONFIG[insight.category] ?? CATEGORY_CONFIG.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <Card className="group hover:border-zinc-700 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Number badge */}
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-700/40 font-mono text-xs font-bold text-emerald-400">
              {insight.id}
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              {/* Category badge */}
              <Badge variant={config.variant} className="gap-1 text-[11px]">
                {config.icon}
                {config.label}
              </Badge>

              {/* Insight text */}
              <p className="text-sm leading-relaxed text-zinc-200">
                {insight.text}
              </p>

              {/* Signal */}
              <div className="rounded border border-zinc-800 bg-zinc-950/50 px-2.5 py-1.5">
                <p className="font-mono text-[11px] text-zinc-500 leading-relaxed">
                  <span className="text-zinc-600">signal → </span>
                  {insight.signal}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
