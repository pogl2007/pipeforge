"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "@/components/subscription/PaymentModal";

const FREE_FEATURES = [
  "Модели: XGBoost, RandomForest, LinearRegression",
  "Optuna: 10 триалов",
  "5 запусков в день",
  "3 слота сохранения",
];

const PRO_FEATURES = [
  "Все модели + LightGBM, CatBoost, SVM, KNN, MLP",
  "Optuna: 50 триалов",
  "Безлимитные запуски",
  "SHAP-объяснение, экспорт .pkl",
];

export function SubscriptionActions({
  planExpiresAt,
}: {
  planExpiresAt: string | null;
}) {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const plan = session?.user?.plan ?? "FREE";

  return (
    <>
      <div className="mb-8">
        <div className="text-sm text-text-secondary mb-1">Текущий план</div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-semibold text-accent-text">{plan}</span>
          {plan === "PRO" && planExpiresAt && (
            <span className="text-xs text-text-muted">
              до {new Date(planExpiresAt).toLocaleDateString("ru-RU")}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <h3 className="text-lg font-medium mb-4">FREE</h3>
          <ul className="flex-1 space-y-2.5 mb-4">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="text-sm text-text-secondary flex gap-2">
                <span className="text-text-muted">–</span>
                {f}
              </li>
            ))}
          </ul>
          {plan === "FREE" && <Badge variant="accent">Текущий план</Badge>}
        </Card>

        <Card className="flex flex-col border-accent shadow-accent-glow-lg">
          <h3 className="text-lg font-medium mb-4 text-accent-text">PRO — 199 ₽/мес</h3>
          <ul className="flex-1 space-y-2.5 mb-4">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="text-sm text-text-secondary flex gap-2">
                <span className="text-accent">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {plan === "PRO" ? (
            <Badge variant="accent">Текущий план</Badge>
          ) : (
            <Button variant="accent" onClick={() => setModalOpen(true)}>
              Оформить PRO
            </Button>
          )}
        </Card>
      </div>

      <PaymentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
