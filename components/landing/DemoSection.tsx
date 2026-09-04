"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  { icon: "🖱️", title: "Перетащи блоки", desc: "Из сайдбара на канвас: данные, препроцессинг, модели" },
  { icon: "🔗", title: "Соедини стрелками", desc: "Тяни от точки к точке, строй свою логику" },
  { icon: "🚀", title: "Запусти и получи результат", desc: "Optuna подберёт параметры, SHAP объяснит решение" },
];

const DEMO_NODES = [
  { id: "csv", icon: "📄", label: "Titanic", badge: "DATA" as const },
  { id: "impute", icon: "🕳️", label: "Drop Nulls", badge: "PREP" as const },
  { id: "encode", icon: "🔤", label: "Encode Cats", badge: "PREP" as const },
  { id: "xgb", icon: "⚡", label: "XGBoost", badge: "MODEL" as const },
  { id: "cmp", icon: "🏆", label: "Compare", badge: "EVAL" as const },
];

const BADGE_COLOR = {
  DATA: "text-sky-300 border-sky-900 bg-node-data",
  PREP: "text-lime-300 border-lime-900 bg-node-prep",
  MODEL: "text-accent-text border-border-strong bg-node-model",
  EVAL: "text-purple-300 border-purple-900 bg-node-eval",
};

export function DemoSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % DEMO_NODES.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wide text-accent-text mb-3 block text-center">
            Процесс
          </span>
          <h2 className="text-3xl font-semibold text-center mb-16">Как это работает</h2>
        </Reveal>

        <Reveal delay={0.1} className="bg-surface2 border border-border rounded-lg p-10 mb-16 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-[720px] justify-center">
            {DEMO_NODES.map((node, i) => (
              <div key={node.id} className="flex items-center gap-4">
                <motion.div
                  animate={{
                    borderColor: active === i ? "#f97316" : "#2a2218",
                    boxShadow: active === i ? "0 0 0 1px #f9731640" : "0 0 0 0px transparent",
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-32 rounded-lg border bg-surface p-3 shrink-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{node.icon}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border ${BADGE_COLOR[node.badge]}`}
                    >
                      {node.badge}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-text-primary">{node.label}</div>
                </motion.div>
                {i < DEMO_NODES.length - 1 && (
                  <svg width="32" height="2" className="shrink-0">
                    <line
                      x1="0"
                      y1="1"
                      x2="32"
                      y2="1"
                      stroke={active > i ? "#f97316" : "#3d3020"}
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="text-2xl mb-3">{step.icon}</div>
              <h3 className="text-lg font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
