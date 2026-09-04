import { Reveal } from "@/components/landing/Reveal";

const STATS = [
  { value: "8", label: "моделей на выбор" },
  { value: "50", label: "optuna-триалов на PRO" },
  { value: "6", label: "блоков препроцессинга" },
  { value: "1 клик", label: "экспорт .pkl модели" },
];

export function StatsBand() {
  return (
    <section className="py-20 px-6 border-b border-border">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="text-center md:text-left">
              <div className="font-mono text-4xl md:text-5xl font-semibold text-accent-text tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary mt-2">{stat.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
