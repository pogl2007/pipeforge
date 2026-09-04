"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Не удалось зарегистрироваться");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/auth/login");
      return;
    }

    router.push("/build");
    router.refresh();
  };

  return (
    <div className="bg-surface2 border border-border rounded-lg p-8 w-full">
      <h1 className="text-xl font-semibold mb-1">Регистрация</h1>
      <p className="text-sm text-text-secondary mb-6">
        Создай аккаунт и построй свой первый пайплайн.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Имя"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как к тебе обращаться"
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 8 символов"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full mt-2" disabled={loading}>
          {loading ? "Создаём аккаунт…" : "Начать бесплатно"}
        </Button>
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="text-accent-text hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
