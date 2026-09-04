import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/landing/Reveal";

const FEATURES = [
  {
    icon: "📂",
    title: "Данные",
    desc: "CSV, Excel, встроенные датасеты Titanic и Iris",
    span: "lg:col-span-3",
  },
  {
    icon: "⚡",
    title: "Optuna",
    desc: "Автоподбор гиперпараметров за 50 триалов на PRO",
    span: "lg:col-span-3",
  },
  {
    icon: "🔧",
    title: "Препроцессинг",
    desc: "6 блоков обработки данных",
    span: "lg:col-span-2",
  },
  {
    icon: "🤖",
    title: "8 моделей",
    desc: "От LinearReg до CatBoost",
    span: "lg:col-span-2",
  },
  {
    icon: "🔍",
    title: "SHAP",
    desc: "Объяснение, какие признаки важны и почему",
    span: "lg:col-span-2",
  },
  {
    icon: "💾",
    title: "Экспорт модели",
    desc: "Скачай готовую .pkl одной кнопкой и подключи к своему проекту",
    span: "lg:col-span-6",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-28 px-6 bg-surface/40">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wide text-accent-text mb-3 block text-center">
            Возможности
          </span>
          <h2 className="text-3xl font-semibold text-center mb-16">Что внутри</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={f.span}>
              <Card hover className="h-full transition-transform duration-200">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
