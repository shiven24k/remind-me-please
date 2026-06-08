"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function OllamaStatus() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/extract");
        const data = await res.json();
        setAvailable(data.ollamaAvailable);
      } catch {
        setAvailable(false);
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs" title={available ? "Ollama connected — LLM extraction active" : "Ollama offline — using heuristics"}>
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          available === null && "bg-gray-400 animate-pulse",
          available === true && "bg-green-400",
          available === false && "bg-yellow-400"
        )}
      />
      <span className="text-gray-200 hidden sm:inline text-[11px]">
        {available === null ? "…" : available ? "LLM" : "Heuristics"}
      </span>
    </div>
  );
}
