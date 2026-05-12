"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/30">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-base font-bold tracking-tight text-zinc-100">
                InsightPilot
              </span>
              <span className="hidden sm:inline-block rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                v0.1
              </span>
            </div>
          </div>

          {/* Tagline + Controls */}
          <div className="flex items-center gap-3">
            <span className="hidden md:block font-mono text-xs text-zinc-500">
              Upload data. Get clarity.
            </span>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-zinc-400" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-600" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
