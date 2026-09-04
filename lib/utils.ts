import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}с`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}м ${rest}с`;
}

export function scoreColor(score: number): string {
  if (score > 0.75) return "text-success";
  if (score >= 0.5) return "text-warning";
  return "text-danger";
}

const MODEL_LABELS: Record<string, string> = {
  xgboost: "XGBoost",
  randomforest: "RandomForest",
  linear_model: "LinearReg",
  lightgbm: "LightGBM",
  catboost: "CatBoost",
  svm: "SVM",
  knn: "KNN",
  mlp: "MLP",
};

export function modelLabel(type: string): string {
  return MODEL_LABELS[type] ?? type;
}
