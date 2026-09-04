"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Reveal } from "@/components/landing/Reveal";

const PipelineFlythrough = dynamic(
  () => import("@/components/landing/PipelineFlythrough").then((m) => m.PipelineFlythrough),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-bg">
        <span className="font-mono text-xs text-text-muted uppercase tracking-wide">
          Загрузка 3D-сцены…
        </span>
      </div>
    ),
  }
);

const STATIC_STAGES = [
  { icon: "📄", label: "Titanic.csv", color: "#38bdf8" },
  { icon: "🕳️", label: "Impute + Scale", color: "#a3e635" },
  { icon: "⚡", label: "XGBoost", color: "#fb923c" },
  { icon: "🎯", label: "Optuna: 50 триалов", color: "#fb923c" },
  { icon: "🔍", label: "SHAP", color: "#c084fc" },
  { icon: "📦", label: "model.pkl", color: "#f97316" },
];

function StaticPipelineOverview() {
  return (
    <section className="py-28 px-6 border-y border-border">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <h2 className="text-3xl font-semibold text-center mb-16">От данных до модели</h2>
        </Reveal>
        <div className="flex flex-col gap-4">
          {STATIC_STAGES.map((stage, i) => (
            <Reveal key={stage.label} delay={i * 0.06}>
              <div className="flex items-center gap-4 bg-surface2 border border-border rounded-lg px-5 py-4 shadow-card">
                <span className="text-2xl">{stage.icon}</span>
                <span className="font-mono text-text-primary">{stage.label}</span>
                <span
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ background: stage.color }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PipelineFlythroughLoader() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Avoid rendering either variant until the media query is known, so
  // server/client markup doesn't mismatch during hydration.
  if (reducedMotion === null) return null;

  return reducedMotion ? <StaticPipelineOverview /> : <PipelineFlythrough />;
}
