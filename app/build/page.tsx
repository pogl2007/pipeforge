import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BuilderLayout } from "@/components/builder/BuilderLayout";
import type { Pipeline } from "@/types";

export default async function BuildPage({
  searchParams,
}: {
  searchParams: { pipeline?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  let initialPipeline: Pipeline | null = null;

  if (searchParams.pipeline) {
    const record = await prisma.pipeline.findUnique({
      where: { id: searchParams.pipeline },
    });
    if (record && record.userId === session.user.id) {
      initialPipeline = {
        id: record.id,
        userId: record.userId,
        name: record.name,
        graph: record.graph as unknown as Pipeline["graph"],
        status: record.status,
        result: record.result as unknown as Pipeline["result"],
        bestScore: record.bestScore,
        bestModel: record.bestModel,
        duration: record.duration,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    }
  }

  return <BuilderLayout initialPipeline={initialPipeline} />;
}
