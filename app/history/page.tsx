import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/planGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { HistoryList } from "@/components/history/HistoryList";
import type { Pipeline } from "@/types";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const historyLimit = PLAN_LIMITS[session.user.plan].historyLimit;

  const records = await prisma.pipeline.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: historyLimit ?? undefined,
  });

  const pipelines: Pipeline[] = records.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    graph: r.graph as unknown as Pipeline["graph"],
    status: r.status,
    result: r.result as unknown as Pipeline["result"],
    bestScore: r.bestScore,
    bestModel: r.bestModel,
    duration: r.duration,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Мои пайплайны</h1>
          <Link href="/build">
            <Button variant="accent">Новый пайплайн +</Button>
          </Link>
        </div>

        <HistoryList pipelines={pipelines} />
      </main>
    </>
  );
}
