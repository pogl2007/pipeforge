export interface Stage {
  label: string;
  sub: string;
  color: string;
  category: "data" | "prep" | "model" | "eval";
  // Scroll-progress fraction (0-1) where this stage's object is centered in
  // the source video — NOT evenly spaced. The generator fused the "prep"
  // ring and "model" crystal into one shared shot instead of two sequential
  // ones, so those two centers sit close together on purpose; the rest are
  // placed at each object's actual on-screen peak, found by scrubbing the
  // source clip (10.005s, captured over its first ~9.855s).
  center: number;
}

export const STAGES: Stage[] = [
  { label: "Titanic.csv", sub: "Источник данных", color: "#38bdf8", category: "data", center: 0.1 },
  { label: "Impute + Scale", sub: "Препроцессинг", color: "#a3e635", category: "prep", center: 0.26 },
  { label: "XGBoost", sub: "Модель", color: "#fb923c", category: "model", center: 0.335 },
  { label: "Optuna: 50 триалов", sub: "Автоподбор параметров", color: "#fb923c", category: "model", center: 0.609 },
  { label: "SHAP", sub: "Объяснение решений", color: "#c084fc", category: "eval", center: 0.812 },
  { label: "model.pkl", sub: "Готовая модель", color: "#f97316", category: "eval", center: 0.974 },
];
