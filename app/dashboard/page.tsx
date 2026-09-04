import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { computeDashboardStats } from "@/lib/dashboardStats";
import { Navbar } from "@/components/layout/Navbar";
import { CountUpCard } from "@/components/dashboard/CountUpCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { TopModels } from "@/components/dashboard/TopModels";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const stats = await computeDashboardStats(session.user.id, session.user.plan);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-2xl font-semibold mb-8">Дашборд</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <CountUpCard label="Пайплайнов запущено" value={stats.totalRuns} />
          <CountUpCard label="Средний скор" value={stats.averageScore * 100} suffix="%" decimals={1} />
          <CountUpCard label="Лучший результат" value={stats.bestScore * 100} suffix="%" decimals={1} />
          <CountUpCard
            label="Экспериментов сегодня"
            value={stats.runsToday}
            suffix={stats.dailyLimit ? `/${stats.dailyLimit}` : ""}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ActivityChart activity={stats.activity} />
          </div>
          <TopModels topModels={stats.topModels} />
        </div>
      </main>
    </>
  );
}
