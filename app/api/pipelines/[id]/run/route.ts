import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRunToday, incrementDailyRuns } from "@/lib/planGuard";
import { runPipelineOnBackend } from "@/lib/api";
import type { PipelineGraph, RunResult } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const pipeline = await prisma.pipeline.findUnique({ where: { id: params.id } });
  if (!pipeline || pipeline.userId !== session.user.id) {
    return NextResponse.json({ error: "Пайплайн не найден" }, { status: 404 });
  }

  const plan = session.user.plan;
  const allowed = await canRunToday(session.user.id, plan);
  if (!allowed) {
    return NextResponse.json(
      { error: "Достигнут дневной лимит запусков для тарифа FREE (5 в день)" },
      { status: 403 }
    );
  }

  await prisma.pipeline.update({
    where: { id: params.id },
    data: { status: "RUNNING" },
  });

  try {
    const result: RunResult = await runPipelineOnBackend(
      pipeline.graph as unknown as PipelineGraph,
      session.user.id,
      plan === "PRO" ? "pro" : "free"
    );

    await incrementDailyRuns(session.user.id);

    await prisma.pipeline.update({
      where: { id: params.id },
      data: {
        status: result.status === "completed" ? "COMPLETED" : "FAILED",
        result: result as unknown as object,
        bestScore: result.best_score ?? null,
        bestModel: result.best_model ?? null,
        duration: result.duration ?? null,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    await prisma.pipeline.update({
      where: { id: params.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Не удалось обучить пайплайн" },
      { status: 502 }
    );
  }
}
