import { prisma } from "@/lib/prisma";
import { getRunsToday, PLAN_LIMITS } from "@/lib/planGuard";
import { modelLabel } from "@/lib/utils";
import type { DashboardStats, Plan } from "@/types";

export async function computeDashboardStats(
  userId: string,
  plan: Plan
): Promise<DashboardStats> {
  const completed = await prisma.pipeline.findMany({
    where: { userId, status: "COMPLETED" },
    select: { bestScore: true, bestModel: true, createdAt: true },
  });

  const totalRuns = completed.length;
  const averageScore =
    totalRuns > 0
      ? completed.reduce((sum, p) => sum + (p.bestScore ?? 0), 0) / totalRuns
      : 0;

  const best = completed.reduce<(typeof completed)[number] | null>(
    (acc, p) => (!acc || (p.bestScore ?? 0) > (acc.bestScore ?? 0) ? p : acc),
    null
  );

  const runsToday = await getRunsToday(userId);
  const dailyLimit = PLAN_LIMITS[plan].dailyRuns;

  const days: { date: string; runs: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const runs = completed.filter(
      (p) => p.createdAt.toISOString().slice(0, 10) === key
    ).length;
    days.push({ date: key, runs });
  }

  const modelCounts = new Map<string, number>();
  completed.forEach((p) => {
    if (!p.bestModel) return;
    modelCounts.set(p.bestModel, (modelCounts.get(p.bestModel) ?? 0) + 1);
  });
  const topModels = Array.from(modelCounts.entries())
    .map(([model, wins]) => ({ model: modelLabel(model), wins }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5);

  return {
    totalRuns,
    averageScore,
    bestScore: best?.bestScore ?? 0,
    bestModel: best?.bestModel ? modelLabel(best.bestModel) : null,
    runsToday,
    dailyLimit,
    activity: days,
    topModels,
  };
}
