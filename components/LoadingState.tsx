"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Parsing data structure…",
  "Detecting business signals…",
  "Analyzing patterns…",
  "Evaluating concentration risks…",
  "Identifying anomalies…",
  "Generating recommendations…",
  "Finalizing analysis…",
];

export default function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1600);

    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);

    return () => {
      clearInterval(msgTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Animated grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-sm bg-emerald-500/30 animate-pulse"
            style={{ animationDelay: `${(i * 80) % 800}ms` }}
          />
        ))}
      </div>

      {/* Status text */}
      <div className="space-y-1 text-center">
        <p className="font-mono text-sm text-zinc-300">
          {MESSAGES[msgIndex]}
          <span className="inline-block w-5 text-left text-emerald-400">{dots}</span>
        </p>
        <p className="font-mono text-xs text-zinc-600">
          AI analysis in progress
        </p>
      </div>
    </div>
  );
}
