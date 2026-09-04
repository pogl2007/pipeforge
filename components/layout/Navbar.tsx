import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-bg/70 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <Link href="/" className="font-mono text-lg font-semibold text-accent tracking-tight">
          PIPEFORGE
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  Мои пайплайны
                </Button>
              </Link>
              <Link href="/dashboard">
                <div className="w-8 h-8 rounded-full bg-accent-subtle border border-border-strong flex items-center justify-center text-xs font-mono text-accent-text">
                  {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="accent" size="sm">
                  Начать бесплатно
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
