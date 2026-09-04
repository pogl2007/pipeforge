import { CodeBlock } from "@/components/ui/CodeBlock";
import { Reveal } from "@/components/landing/Reveal";

const SAMPLE_CODE = `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier

pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
    ('model',   XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.08
    ))
])
pipeline.fit(X_train, y_train)`;

export function CodeShowcase() {
  return (
    <section className="py-28 px-6 bg-surface/40 border-y border-border">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wide text-accent-text mb-3 block">
            Код, а не чёрный ящик
          </span>
          <h2 className="text-3xl font-semibold mb-4 text-balance">
            Каждый граф превращается
            <br />в настоящий sklearn-код
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-md">
            Никакой магии внутри непрозрачного движка. После обучения
            получаешь рабочий Python-файл с точными гиперпараметрами,
            которые подобрала Optuna. Запускай его где угодно.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <CodeBlock code={SAMPLE_CODE} />
        </Reveal>
      </div>
    </section>
  );
}
