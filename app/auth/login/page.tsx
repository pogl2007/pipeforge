"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/build");
    router.refresh();
  };

  return (
    <div className="bg-surface2 border border-border rounded-lg p-8 w-full">
      <h1 className="text-xl font-semibold mb-1">Вход</h1>
      <p className="text-sm text-text-secondary mb-6">
        Рады видеть снова. Введи данные для входа.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          id="password"
          label="Пароль"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full mt-2" disabled={loading}>
          {loading ? "Входим…" : "Войти"}
        </Button>
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Нет аккаунта?{" "}
        <Link href="/auth/register" className="text-accent-text hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
