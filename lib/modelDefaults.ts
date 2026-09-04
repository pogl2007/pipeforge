export const MODEL_HYPERPARAM_RANGES: Record<string, { label: string; range: string }[]> = {
  xgboost: [
    { label: "n_estimators", range: "50 – 500" },
    { label: "max_depth", range: "3 – 10" },
    { label: "learning_rate", range: "0.01 – 0.3" },
    { label: "subsample", range: "0.6 – 1.0" },
  ],
  randomforest: [
    { label: "n_estimators", range: "50 – 300" },
    { label: "max_depth", range: "3 – 15" },
    { label: "min_samples_split", range: "2 – 10" },
  ],
  linear_model: [{ label: "alpha (регуляризация)", range: "0.0001 – 10" }],
  lightgbm: [
    { label: "n_estimators", range: "50 – 500" },
    { label: "num_leaves", range: "20 – 100" },
    { label: "learning_rate", range: "0.01 – 0.3" },
  ],
  catboost: [
    { label: "iterations", range: "50 – 500" },
    { label: "depth", range: "3 – 10" },
    { label: "learning_rate", range: "0.01 – 0.3" },
  ],
  svm: [
    { label: "C", range: "0.1 – 100" },
    { label: "kernel", range: "rbf / linear / poly" },
  ],
  knn: [{ label: "n_neighbors", range: "3 – 20" }],
  mlp: [
    { label: "hidden_layer_sizes", range: "(32) – (256, 128)" },
    { label: "learning_rate_init", range: "0.0001 – 0.01" },
  ],
};
