"use client";

import { motion } from "framer-motion";

const MINI_BLOCKS = [
  { icon: "📄", top: "20%", left: "18%", delay: 0 },
  { icon: "📏", top: "55%", left: "10%", delay: 0.4 },
  { icon: "⚡", top: "15%", left: "60%", delay: 0.8 },
  { icon: "🏆", top: "68%", left: "62%", delay: 1.2 },
  { icon: "🔍", top: "40%", left: "78%", delay: 0.6 },
  { icon: "🕳️", top: "80%", left: "30%", delay: 1.0 },
];

export function AuthVisual() {
  return (
    <div className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden dot-grid-bg border-r border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-subtle/40 via-transparent to-transparent" />

      {MINI_BLOCKS.map((block, i) => (
        <motion.div
          key={i}
          className="absolute w-14 h-14 rounded-lg border border-border-strong bg-surface2/70 backdrop-blur-sm flex items-center justify-center text-2xl"
          style={{ top: block.top, left: block.left }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: block.delay }}
        >
          {block.icon}
        </motion.div>
      ))}

      <div className="relative z-10 font-mono text-4xl font-semibold text-accent tracking-tight">
        PIPEFORGE
      </div>
    </div>
  );
}
