import type { BlockDef, NodeCategory } from "@/types";

export const BLOCK_CATALOG: BlockDef[] = [
  // Данные
  {
    type: "csv_upload",
    category: "data",
    label: "CSV Upload",
    description: "Загрузить свой файл",
    icon: "📄",
  },
  {
    type: "excel_upload",
    category: "data",
    label: "Excel Upload",
    description: ".xlsx файл",
    icon: "🗂️",
  },
  {
    type: "titanic",
    category: "data",
    label: "Titanic",
    description: "Встроенный датасет",
    icon: "🎯",
  },
  {
    type: "iris",
    category: "data",
    label: "Iris",
    description: "Встроенный датасет",
    icon: "🌸",
  },
  {
    type: "california_housing",
    category: "data",
    label: "California Housing",
    description: "Встроенный датасет",
    icon: "🏠",
  },

  // Препроцессинг
  {
    type: "imputer",
    category: "prep",
    label: "Drop Nulls",
    description: "Заполнить пропуски",
    icon: "🕳️",
    defaultParams: { strategy: "median" },
  },
  {
    type: "scaler",
    category: "prep",
    label: "Scale Nums",
    description: "Нормализация",
    icon: "📏",
  },
  {
    type: "encoder",
    category: "prep",
    label: "Encode Cats",
    description: "Кодирование категорий",
    icon: "🔤",
  },
  {
    type: "train_test_split",
    category: "prep",
    label: "Train/Test",
    description: "Разбить датасет",
    icon: "✂️",
    defaultParams: { test_size: 0.2 },
  },
  {
    type: "feature_select",
    category: "prep",
    label: "Select Features",
    description: "Отбор признаков",
    icon: "🎯",
    defaultParams: { k: 10 },
  },
  {
    type: "pca",
    category: "prep",
    label: "PCA",
    description: "Снижение размерности",
    icon: "📉",
    defaultParams: { n_components: 5 },
  },

  // Модели — FREE
  {
    type: "xgboost",
    category: "model",
    label: "XGBoost",
    description: "Градиентный бустинг",
    icon: "⚡",
  },
  {
    type: "randomforest",
    category: "model",
    label: "RandomForest",
    description: "Ансамбль деревьев",
    icon: "🌲",
  },
  {
    type: "linear_model",
    category: "model",
    label: "LinearReg / LogReg",
    description: "Линейная модель",
    icon: "📈",
  },

  // Модели — PRO
  {
    type: "lightgbm",
    category: "model",
    label: "LightGBM",
    description: "Быстрый бустинг",
    icon: "💡",
    pro: true,
  },
  {
    type: "catboost",
    category: "model",
    label: "CatBoost",
    description: "Бустинг с категориями",
    icon: "🐱",
    pro: true,
  },
  {
    type: "svm",
    category: "model",
    label: "SVM",
    description: "Опорные вектора",
    icon: "🔵",
    pro: true,
  },
  {
    type: "knn",
    category: "model",
    label: "KNN",
    description: "Ближайшие соседи",
    icon: "👥",
    pro: true,
  },
  {
    type: "mlp",
    category: "model",
    label: "MLP",
    description: "Нейросеть",
    icon: "🧠",
    pro: true,
  },

  // Оценка
  {
    type: "compare_models",
    category: "eval",
    label: "Compare Models",
    description: "Сравнить все модели",
    icon: "🏆",
  },
  {
    type: "shap",
    category: "eval",
    label: "SHAP",
    description: "Важность признаков",
    icon: "🔍",
    pro: true,
  },
  {
    type: "roc_curve",
    category: "eval",
    label: "ROC Curve",
    description: "Кривая ROC",
    icon: "📉",
  },
  {
    type: "confusion_matrix",
    category: "eval",
    label: "Confusion Matrix",
    description: "Матрица ошибок",
    icon: "🔲",
  },
];

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  data: "Данные",
  prep: "Препроцессинг",
  model: "Модели",
  eval: "Оценка",
};

export function blocksByCategory(category: NodeCategory): BlockDef[] {
  return BLOCK_CATALOG.filter((b) => b.category === category);
}

export function findBlock(type: string): BlockDef | undefined {
  return BLOCK_CATALOG.find((b) => b.type === type);
}
