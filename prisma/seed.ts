import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function buildGraph(modelType: string, includeShap: boolean) {
  const nodes = [
    {
      id: "n1",
      type: "dataNode",
      position: { x: 0, y: 0 },
      data: { category: "data", nodeType: "titanic", label: "Titanic", icon: "🎯", params: {} },
    },
    {
      id: "n2",
      type: "prepNode",
      position: { x: 0, y: 120 },
      data: {
        category: "prep",
        nodeType: "imputer",
        label: "Drop Nulls",
        icon: "🕳️",
        params: { strategy: "median" },
      },
    },
    {
      id: "n3",
      type: "prepNode",
      position: { x: 0, y: 240 },
      data: { category: "prep", nodeType: "scaler", label: "Scale Nums", icon: "📏", params: {} },
    },
    {
      id: "n4",
      type: "prepNode",
      position: { x: 0, y: 360 },
      data: { category: "prep", nodeType: "encoder", label: "Encode Cats", icon: "🔤", params: {} },
    },
    {
      id: "n5",
      type: "prepNode",
      position: { x: 0, y: 480 },
      data: {
        category: "prep",
        nodeType: "train_test_split",
        label: "Train/Test",
        icon: "✂️",
        params: { test_size: 0.2 },
      },
    },
    {
      id: "n6",
      type: "modelNode",
      position: { x: 0, y: 600 },
      data: { category: "model", nodeType: modelType, label: modelType, icon: "⚡", params: {} },
    },
    {
      id: "n7",
      type: "evalNode",
      position: { x: 0, y: 720 },
      data: {
        category: "eval",
        nodeType: "compare_models",
        label: "Compare Models",
        icon: "🏆",
        params: {},
      },
    },
  ];

  const edges = [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n2", target: "n3" },
    { id: "e3", source: "n3", target: "n4" },
    { id: "e4", source: "n4", target: "n5" },
    { id: "e5", source: "n5", target: "n6" },
    { id: "e6", source: "n6", target: "n7" },
  ];

  if (includeShap) {
    nodes.push({
      id: "n8",
      type: "evalNode",
      position: { x: 120, y: 720 },
      data: { category: "eval", nodeType: "shap", label: "SHAP", icon: "🔍", params: {} },
    });
    edges.push({ id: "e7", source: "n6", target: "n8" });
  }

  return { nodes, edges };
}

function buildResult(modelType: string, score: number, includeShap: boolean) {
  const models = [
    { name: modelType, type: modelType, accuracy: score, f1: score - 0.01 },
    { name: "randomforest", type: "randomforest", accuracy: score - 0.04, f1: score - 0.05 },
    { name: "linear_model", type: "linear_model", accuracy: score - 0.09, f1: score - 0.1 },
  ];

  const optuna_history = Array.from({ length: 10 }, (_, i) => ({
    trial: i + 1,
    score: Math.min(0.95, score - 0.05 + i * 0.006 + Math.random() * 0.01),
  }));

  return {
    status: "completed",
    duration: 8 + Math.random() * 10,
    best_model: modelType,
    best_score: score,
    metric_name: "accuracy",
    task_type: "classification",
    best_params: { n_estimators: 200, max_depth: 6, learning_rate: 0.08 },
    models,
    optuna_history,
    shap: includeShap
      ? [
          { feature: "Sex", importance: 0.42 },
          { feature: "Pclass", importance: 0.31 },
          { feature: "Age", importance: -0.18 },
          { feature: "Fare", importance: 0.12 },
        ]
      : null,
    generated_code:
      "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n" +
      "from sklearn.impute import SimpleImputer\n\npipeline = Pipeline([\n" +
      "    ('imputer', SimpleImputer(strategy='median')),\n" +
      "    ('scaler', StandardScaler()),\n" +
      `    ('model', ${modelType}()),\n])\npipeline.fit(X_train, y_train)`,
    model_binary: null,
  };
}

async function main() {
  const passwordHash = await bcrypt.hash("test12345", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@pipeforge.ru" },
    update: { plan: "PRO", passwordHash },
    create: {
      email: "test@pipeforge.ru",
      passwordHash,
      name: "Тестовый пользователь",
      plan: "PRO",
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.pipeline.deleteMany({ where: { userId: user.id } });

  const seedPipelines = [
    { name: "Titanic: выживаемость (XGBoost)", model: "xgboost", score: 0.842, status: "COMPLETED" as const, shap: true },
    { name: "Titanic: сравнение моделей", model: "lightgbm", score: 0.817, status: "COMPLETED" as const, shap: true },
    { name: "Titanic: baseline RandomForest", model: "randomforest", score: 0.793, status: "COMPLETED" as const, shap: false },
    { name: "Titanic: черновик пайплайна", model: "xgboost", score: 0, status: "DRAFT" as const, shap: false },
    { name: "Titanic: неудачный запуск", model: "catboost", score: 0, status: "FAILED" as const, shap: false },
  ];

  for (const p of seedPipelines) {
    const graph = buildGraph(p.model, p.shap);
    const isCompleted = p.status === "COMPLETED";
    const result = isCompleted ? buildResult(p.model, p.score, p.shap) : null;

    await prisma.pipeline.create({
      data: {
        userId: user.id,
        name: p.name,
        graph: graph as unknown as object,
        status: p.status,
        result: result as unknown as object,
        bestScore: isCompleted ? p.score : null,
        bestModel: isCompleted ? p.model : null,
        duration: isCompleted ? result!.duration : null,
      },
    });
  }

  console.log("Seed завершён: test@pipeforge.ru / test12345 / PRO, 5 пайплайнов");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
