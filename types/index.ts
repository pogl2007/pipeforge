export type Plan = "FREE" | "PRO";

export type PipelineStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export type DataNodeType =
  | "csv_upload"
  | "excel_upload"
  | "titanic"
  | "iris"
  | "california_housing";

export type PrepNodeType =
  | "imputer"
  | "scaler"
  | "encoder"
  | "train_test_split"
  | "feature_select"
  | "pca";

export type FreeModelType = "xgboost" | "randomforest" | "linear_model";

export type ProModelType =
  | "lightgbm"
  | "catboost"
  | "svm"
  | "knn"
  | "mlp";

export type ModelNodeType = FreeModelType | ProModelType;

export type EvalNodeType =
  | "compare_models"
  | "shap"
  | "roc_curve"
  | "confusion_matrix";

export type PipelineNodeType =
  | DataNodeType
  | PrepNodeType
  | ModelNodeType
  | EvalNodeType;

export type NodeCategory = "data" | "prep" | "model" | "eval";

export type NodeRunState = "idle" | "running" | "done" | "error";

export interface BlockDef {
  type: PipelineNodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  pro?: boolean;
  defaultParams?: Record<string, unknown>;
}

export interface PipelineNodeData {
  category: NodeCategory;
  nodeType: PipelineNodeType;
  label: string;
  icon: string;
  params: Record<string, unknown>;
  runState?: NodeRunState;
  fileName?: string;
  preview?: {
    columns: string[];
    rows: (string | number | null)[][];
    shape: [number, number];
  };
}

export interface PipelineNode {
  id: string;
  type: "dataNode" | "prepNode" | "modelNode" | "evalNode";
  position: { x: number; y: number };
  data: PipelineNodeData;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface PipelineGraph {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export interface ModelResult {
  name: string;
  type: ModelNodeType;
  accuracy?: number;
  f1?: number;
  rmse?: number;
  r2?: number;
}

export interface OptunaTrial {
  trial: number;
  score: number;
}

export interface ShapValue {
  feature: string;
  importance: number;
  direction?: "positive" | "negative";
}

export interface RunResult {
  status: "completed" | "failed";
  duration: number;
  best_model: ModelNodeType;
  best_score: number;
  metric_name: string;
  task_type: "classification" | "regression";
  best_params: Record<string, number | string>;
  models: ModelResult[];
  optuna_history: OptunaTrial[];
  shap: ShapValue[] | null;
  generated_code: string;
  model_binary: string | null;
  error?: string;
}

export interface Pipeline {
  id: string;
  userId: string;
  name: string;
  graph: PipelineGraph;
  status: PipelineStatus;
  result: RunResult | null;
  bestScore: number | null;
  bestModel: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRuns: number;
  averageScore: number;
  bestScore: number;
  bestModel: string | null;
  runsToday: number;
  dailyLimit: number | null;
  activity: { date: string; runs: number }[];
  topModels: { model: string; wins: number }[];
}

export interface GraphValidation {
  valid: boolean;
  errors: string[];
}
