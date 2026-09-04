import { prisma } from "@/lib/prisma";
import type { Plan } from "@/types";

export const PLAN_LIMITS = {
  FREE: {
    dailyRuns: 5,
    optunaTrials: 10,
    parallelTraining: false,
    shap: false,
    exportModel: false,
    historyLimit: 10,
    saveSlots: 3,
    models: ["xgboost", "randomforest", "linear_model"] as const,
  },
  PRO: {
    dailyRuns: null,
    optunaTrials: 50,
    parallelTraining: true,
    shap: true,
    exportModel: true,
    historyLimit: null,
    saveSlots: null,
    models: [
      "xgboost",
      "randomforest",
      "linear_model",
      "lightgbm",
      "catboost",
      "svm",
      "knn",
      "mlp",
    ] as const,
  },
} satisfies Record<Plan, Record<string, unknown>>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getRunsToday(userId: string): Promise<number> {
  const record = await prisma.dailyRun.findUnique({
    where: { userId_date: { userId, date: todayKey() } },
  });
  return record?.runs ?? 0;
}

export async function canRunToday(userId: string, plan: Plan): Promise<boolean> {
  const limit = PLAN_LIMITS[plan].dailyRuns;
  if (limit === null) return true;
  const runsToday = await getRunsToday(userId);
  return runsToday < limit;
}

export async function incrementDailyRuns(userId: string): Promise<void> {
  const date = todayKey();
  await prisma.dailyRun.upsert({
    where: { userId_date: { userId, date } },
    update: { runs: { increment: 1 } },
    create: { userId, date, runs: 1 },
  });
}

export function isModelAllowed(plan: Plan, modelType: string): boolean {
  return (PLAN_LIMITS[plan].models as readonly string[]).includes(modelType);
}
