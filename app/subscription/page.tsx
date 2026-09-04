import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { SubscriptionActions } from "@/components/subscription/SubscriptionActions";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planExpiresAt: true },
  });

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-2xl font-semibold mb-8">Подписка</h1>
        <SubscriptionActions
          planExpiresAt={user?.planExpiresAt?.toISOString() ?? null}
        />
      </main>
    </>
  );
}
