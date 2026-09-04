"use client";

import { motion } from "framer-motion";
import { modelLabel } from "@/lib/utils";
import { findBlock } from "@/lib/blocks";
import type { ModelResult } from "@/types";

export function ModelComparison({
  models,
  bestModel,
}: {
  models: ModelResult[];
  bestModel: string;
}) {
  const sorted = [...models].sort(
    (a, b) => (b.accuracy ?? b.r2 ?? 0) - (a.accuracy ?? a.r2 ?? 0)
  );
  const max = Math.max(...sorted.map((m) => m.accuracy ?? m.r2 ?? 0), 0.01);

  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Сравнение моделей</h3>
      <div className="flex flex-col gap-3">
        {sorted.map((m, i) => {
          const score = m.accuracy ?? m.r2 ?? 0;
          const isBest = m.type === bestModel;
          const icon = findBlock(m.type)?.icon ?? "🤖";

          return (
            <div
              key={m.type}
              className={`flex items-center gap-3 p-2 rounded ${
                isBest ? "border border-accent bg-accent-subtle/40" : ""
              }`}
            >
              <span className="w-24 shrink-0 text-xs font-mono text-text-primary flex items-center gap-1.5">
                <span>{icon}</span>
                {modelLabel(m.type)}
              </span>
              <div className="flex-1 h-4 bg-surface rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                  className={`h-full ${isBest ? "bg-accent" : "bg-border-strong"}`}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs font-mono text-text-primary">
                {(score * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
