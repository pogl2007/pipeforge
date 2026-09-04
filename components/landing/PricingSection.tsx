import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/landing/Reveal";

const FREE_FEATURES = [
  "Модели: XGBoost, RandomForest, LinearRegression",
  "Optuna: 10 триалов",
  "Обучение по одной модели",
  "5 запусков в день",
  "История: последние 10 пайплайнов",
  "3 слота сохранения",
];

const PRO_FEATURES = [
  "Все модели + LightGBM, CatBoost, SVM, KNN, MLP",
  "Optuna: 50 триалов",
  "Параллельное обучение моделей",
  "Безлимитные запуски",
  "Вся история пайплайнов",
  "SHAP-объяснение моделей",
  "Экспорт модели .pkl",
  "Неограниченные слоты сохранения",
];

export function PricingSection() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wide text-accent-text mb-3 block text-center">
            Тарифы
          </span>
          <h2 className="text-3xl font-semibold text-center mb-16">Просто и честно</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={0.05}>
          <Card className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-1">FREE</h3>
              <div className="font-mono text-3xl">0 ₽</div>
            </div>
            <ul className="flex-1 space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-text-muted">–</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register">
              <Button variant="ghost" className="w-full">
                Начать бесплатно
              </Button>
            </Link>
          </Card>
          </Reveal>

          <Reveal delay={0.12}>
          <Card className="flex flex-col relative border-accent shadow-accent-glow-lg">
            <Badge variant="accent" className="absolute -top-3 right-5">
              Популярный
            </Badge>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-1 text-accent-text">PRO</h3>
              <div className="font-mono text-3xl">
                199 ₽<span className="text-sm text-text-secondary font-sans">/мес</span>
              </div>
            </div>
            <ul className="flex-1 space-y-3 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/subscription">
              <Button variant="accent" className="w-full">
                Оформить PRO
              </Button>
            </Link>
          </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
