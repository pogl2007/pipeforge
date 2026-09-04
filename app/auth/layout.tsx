import Link from "next/link";
import { AuthVisual } from "@/components/auth/AuthVisual";
import { AuthTransition } from "@/components/auth/AuthTransition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg">
      <AuthVisual />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm flex flex-col items-center">
          <Link
            href="/"
            className="font-mono text-lg font-semibold text-accent tracking-tight mb-10 lg:hidden"
          >
            PIPEFORGE
          </Link>
          <AuthTransition>{children}</AuthTransition>
        </div>
      </div>
    </div>
  );
}
