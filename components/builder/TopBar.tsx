"use client";

import { useState } from "react";
import Link from "next/link";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import { Button } from "@/components/ui/Button";
import { RunButton } from "@/components/builder/RunButton";
import type { PipelineGraph, PipelineStatus } from "@/types";

const STATUS_LABEL: Record<PipelineStatus, string> = {
  DRAFT: "Черновик",
  RUNNING: "Выполняется",
  COMPLETED: "Готово",
  FAILED: "Ошибка",
};

const STATUS_COLOR: Record<PipelineStatus, string> = {
  DRAFT: "text-text-secondary",
  RUNNING: "text-accent",
  COMPLETED: "text-success",
  FAILED: "text-danger",
};

export function TopBar() {
  const pipelineName = usePipelineStore((s) => s.pipelineName);
  const setPipelineName = usePipelineStore((s) => s.setPipelineName);
  const status = usePipelineStore((s) => s.status);
  const nodes = usePipelineStore((s) => s.nodes);
  const edges = usePipelineStore((s) => s.edges);
  const pipelineId = usePipelineStore((s) => s.pipelineId);
  const setPipelineId = usePipelineStore((s) => s.setPipelineId);
  const clearGraph = usePipelineStore((s) => s.clearGraph);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(pipelineName);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const buildGraph = (): PipelineGraph => ({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as PipelineGraph["nodes"][number]["type"],
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!pipelineId) {
        const res = await fetch("/api/pipelines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: pipelineName, graph: buildGraph() }),
        });
        const data = await res.json();
        setPipelineId(data.pipelineId);
      } else {
        await fetch(`/api/pipelines/${pipelineId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: pipelineName, graph: buildGraph() }),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const commitName = () => {
    setPipelineName(nameDraft.trim() || "Без названия");
    setEditingName(false);
  };

  return (
    <div className="h-12 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="font-mono text-sm font-semibold text-accent shrink-0">
          PF
        </Link>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
            className="bg-surface2 border border-accent rounded px-2 py-1 text-sm text-text-primary outline-none min-w-[160px]"
          />
        ) : (
          <button
            onClick={() => {
              setNameDraft(pipelineName);
              setEditingName(true);
            }}
            className="text-sm text-text-primary hover:text-accent-text truncate max-w-[240px]"
          >
            {pipelineName}
          </button>
        )}
      </div>

      <div className={`text-xs font-mono ${STATUS_COLOR[status]} shrink-0`}>
        {STATUS_LABEL[status]}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </Button>

        {confirmClear ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">Точно очистить?</span>
            <Button
              variant="danger-ghost"
              size="sm"
              onClick={() => {
                clearGraph();
                setConfirmClear(false);
              }}
            >
              Да
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
              Нет
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
            Очистить
          </Button>
        )}

        <RunButton />
      </div>
    </div>
  );
}
