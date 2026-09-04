"use client";

import { motion } from "framer-motion";

// Kept strictly in the side margins (left < 16 or left > 84) so nothing ever
// collides with the centered hero text/buttons, regardless of viewport
// height or how the H1 reflows at different widths.
const GHOST_NODES = [
  { id: "titanic", icon: "🎯", label: "Titanic", sub: "встроенный датасет", top: 12, left: 6, badge: "DATA" },
  { id: "csv", icon: "📄", label: "CSV Upload", sub: "titanic.csv", top: 34, left: 4, badge: "DATA" },
  { id: "impute", icon: "🕳️", label: "Drop Nulls", sub: "strategy=median", top: 56, left: 6, badge: "PREP" },
  { id: "encode", icon: "🔤", label: "Encode Cats", sub: "OneHotEncoder", top: 80, left: 9, badge: "PREP" },
  { id: "xgb", icon: "⚡", label: "XGBoost", sub: "n_estimators=150", top: 10, left: 88, badge: "MODEL" },
  { id: "lgbm", icon: "💡", label: "LightGBM", sub: "num_leaves=64", top: 32, left: 92, badge: "MODEL" },
  { id: "shap", icon: "🔍", label: "SHAP", sub: "feature importance", top: 58, left: 90, badge: "EVAL" },
  { id: "cmp", icon: "🏆", label: "Compare", sub: "5 моделей", top: 81, left: 87, badge: "EVAL" },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [4, 5],
  [5, 6],
  [6, 7],
];

const GLOWS = [
  { top: "10%", left: "10%", color: "#f97316" },
  { top: "70%", left: "88%", color: "#a3e635" },
];

export function HeroCanvas() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 dot-grid-bg animate-grid-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />

      {/*
        The ghost node cards are 164px wide with fixed left/right margins,
        while the H1 has a fixed max-width (not a percentage) — so at
        narrower viewports the text eats a *larger* share of the screen and
        the percentage-based side margins shrink into it. Verified clear at
        1280px (xl) and colliding at 1024px, so this layer is xl+ only.
        Smaller screens keep just the dot grid + gradient for atmosphere.
      */}
      <div className="hidden xl:block">
        {GLOWS.map((glow, i) => (
          <div
            key={i}
            className="absolute w-[420px] h-[420px] rounded-full blur-[120px] opacity-[0.07]"
            style={{ top: glow.top, left: glow.left, background: glow.color, transform: "translate(-50%, -50%)" }}
          />
        ))}

        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {EDGES.map(([from, to], i) => {
            const a = GHOST_NODES[from];
            const b = GHOST_NODES[to];
            return (
              <path
                key={i}
                d={`M ${a.left} ${a.top} C ${a.left} ${(a.top + b.top) / 2}, ${b.left} ${(a.top + b.top) / 2}, ${b.left} ${b.top}`}
                stroke="#3d3020"
                strokeWidth={0.15}
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
            );
          })}
        </svg>

        {GHOST_NODES.map((node, i) => (
          <motion.div
            key={node.id}
            className="absolute w-[164px] rounded-lg border border-border-strong bg-surface2/60 backdrop-blur-sm p-3"
            style={{
              top: `${node.top}%`,
              left: `${node.left}%`,
              // Left-column nodes grow rightward from their anchor; right-column
              // nodes grow leftward, so none of them run off the viewport edge.
              transform: node.left > 50 ? "translateX(-100%)" : undefined,
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-lg">{node.icon}</span>
              <span className="text-[9px] font-mono uppercase tracking-wide text-text-muted border border-border rounded-sm px-1.5 py-0.5">
                {node.badge}
              </span>
            </div>
            <div className="font-mono text-xs text-text-primary">{node.label}</div>
            <div className="font-mono text-[10px] text-text-muted mt-0.5">{node.sub}</div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent/60" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
