"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { ShapValue } from "@/types";

export function ShapChart({
  shap,
  isPro,
}: {
  shap: ShapValue[] | null;
  isPro: boolean;
}) {
  if (!isPro || !shap) {
    return (
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-4">SHAP: важность признаков</h3>
        <div className="border border-border-strong rounded-lg p-6 flex flex-col items-center gap-3 text-center bg-surface">
          <span className="text-2xl">🔒</span>
          <p className="text-sm text-text-secondary">
            Объяснение решений модели доступно в PRO
          </p>
          <Link href="/subscription">
            <Button variant="accent" size="sm">
              Открыть PRO
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const max = Math.max(...shap.map((s) => Math.abs(s.importance)), 0.01);
  const sorted = [...shap].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-4">SHAP: важность признаков</h3>
      <div className="flex flex-col gap-2.5">
        {sorted.map((s, i) => {
          const negative = s.importance < 0;
          return (
            <div key={s.feature} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-mono text-text-secondary truncate">
                {s.feature}
              </span>
              <div className="flex-1 h-3 bg-surface rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.abs(s.importance) / max) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`h-full ${negative ? "bg-sky-500" : "bg-accent"}`}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-mono text-text-primary">
                {s.importance.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
