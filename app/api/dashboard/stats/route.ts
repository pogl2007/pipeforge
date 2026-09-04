import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeDashboardStats } from "@/lib/dashboardStats";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const stats = await computeDashboardStats(session.user.id, session.user.plan);
  return NextResponse.json(stats);
}
