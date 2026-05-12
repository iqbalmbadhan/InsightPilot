"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
}

const MAX_CHARS = 4000;

export default function NotesInput({
  value,
  onChange,
  onLoadExample,
}: NotesInputProps) {
  const remaining = MAX_CHARS - value.length;
  const isNearLimit = remaining < 500;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder={`Paste messy business notes, meeting notes, CRM exports, customer feedback, financial snippets…

Example:
  Q3 review - revenue down 12% vs Q2
  Top complaint: shipping delays (8 tickets this week)
  Inventory: Widget SKU running low, reorder needed
  Lost Acme deal - competitor pricing
  New lead from TradeShow - follow up by Friday`}
          className="min-h-[180px] font-mono text-xs leading-relaxed"
          maxLength={MAX_CHARS}
        />
        <div
          className={`absolute bottom-2 right-2.5 font-mono text-[10px] transition-colors ${
            isNearLimit ? "text-amber-500" : "text-zinc-600"
          }`}
        >
          {remaining.toLocaleString()} left
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {value.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
              <FileText className="h-3 w-3" />
              {value.length.toLocaleString()} chars
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoadExample}
          className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
        >
          Load example notes
        </Button>
      </div>
    </div>
  );
}
