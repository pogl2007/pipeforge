"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex flex-col items-center text-center max-w-3xl"
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-strong bg-accent-subtle text-accent-text text-xs font-mono mb-7"
      >
        ✦ Visual ML Pipeline Builder
      </motion.span>

      <motion.h1
        variants={item}
        className="text-[56px] md:text-[76px] leading-[1.02] tracking-tight font-semibold text-text-primary mb-6 text-balance"
      >
        Строй ML пайплайны
        <br />
        как блок-схемы
      </motion.h1>

      <motion.p
        variants={item}
        className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed text-balance max-w-xl"
      >
        Перетащи блоки. Соедини стрелками. Запусти.
        <br />
        AI подберёт гиперпараметры и найдёт лучшую модель.
      </motion.p>

      <motion.div variants={item} className="flex items-center gap-3">
        <Link href="/build">
          <Button variant="accent" size="lg">
            Открыть конструктор →
          </Button>
        </Link>
        <Link href="#demo">
          <Button variant="ghost" size="lg">
            Смотреть демо
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
