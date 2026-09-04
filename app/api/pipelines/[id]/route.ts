import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PipelineGraph } from "@/types";

async function getOwnedPipeline(id: string, userId: string) {
  const pipeline = await prisma.pipeline.findUnique({ where: { id } });
  if (!pipeline || pipeline.userId !== userId) return null;
  return pipeline;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const pipeline = await getOwnedPipeline(params.id, session.user.id);
  if (!pipeline) {
    return NextResponse.json({ error: "Пайплайн не найден" }, { status: 404 });
  }

  return NextResponse.json({ pipeline });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const existing = await getOwnedPipeline(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Пайплайн не найден" }, { status: 404 });
  }

  const body = await req.json();
  const { name, graph } = body as { name?: string; graph?: PipelineGraph };

  const pipeline = await prisma.pipeline.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(graph !== undefined ? { graph: graph as unknown as object } : {}),
    },
  });

  return NextResponse.json({ pipeline });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const existing = await getOwnedPipeline(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Пайплайн не найден" }, { status: 404 });
  }

  await prisma.pipeline.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
