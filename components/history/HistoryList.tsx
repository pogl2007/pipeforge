"use client";

import { useState } from "react";
import Link from "next/link";
import { PipelineCard } from "@/components/history/PipelineCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Pipeline, PipelineStatus } from "@/types";

type FilterTab = "all" | "completed" | "draft" | "failed";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "completed", label: "Завершённые" },
  { id: "draft", label: "Черновики" },
  { id: "failed", label: "Ошибки" },
];

const TAB_STATUS: Record<Exclude<FilterTab, "all">, PipelineStatus> = {
  completed: "COMPLETED",
  draft: "DRAFT",
  failed: "FAILED",
};

export function HistoryList({ pipelines }: { pipelines: Pipeline[] }) {
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered =
    tab === "all" ? pipelines : pipelines.filter((p) => p.status === TAB_STATUS[tab]);

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
        <span className="text-4xl">📭</span>
        <h2 className="text-lg font-medium">Ещё нет пайплайнов</h2>
        <p className="text-sm text-text-secondary max-w-xs">
          Создай первый пайплайн и обучи модель
        </p>
        <Link href="/build">
          <Button variant="accent">Создать →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors duration-150",
              tab === t.id
                ? "border-accent text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-16">Ничего не найдено</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <PipelineCard key={p.id} pipeline={p} />
          ))}
        </div>
      )}
    </div>
  );
}
