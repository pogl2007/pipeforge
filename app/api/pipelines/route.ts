import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/planGuard";
import type { PipelineGraph } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const historyLimit = PLAN_LIMITS[session.user.plan].historyLimit;

  const pipelines = await prisma.pipeline.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: historyLimit ?? undefined,
  });

  return NextResponse.json({ pipelines });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();
  const { name, graph } = body as { name?: string; graph: PipelineGraph };

  const saveSlots = PLAN_LIMITS[session.user.plan].saveSlots;
  if (saveSlots !== null) {
    const count = await prisma.pipeline.count({ where: { userId: session.user.id } });
    if (count >= saveSlots) {
      return NextResponse.json(
        { error: `Достигнут лимит слотов сохранения (${saveSlots}) для тарифа FREE` },
        { status: 403 }
      );
    }
  }

  const pipeline = await prisma.pipeline.create({
    data: {
      userId: session.user.id,
      name: name || "Без названия",
      graph: graph as unknown as object,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ pipelineId: pipeline.id }, { status: 201 });
}
