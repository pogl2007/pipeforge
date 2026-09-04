"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import { MODEL_HYPERPARAM_RANGES } from "@/lib/modelDefaults";
import type { PipelineNodeType } from "@/types";

function PrepFields({
  nodeType,
  params,
  onChange,
}: {
  nodeType: PipelineNodeType;
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}) {
  switch (nodeType) {
    case "imputer":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary">Стратегия заполнения</label>
          <select
            className="bg-surface border border-border rounded px-2 py-1.5 text-xs text-text-primary"
            value={(params.strategy as string) ?? "median"}
            onChange={(e) => onChange({ strategy: e.target.value })}
          >
            <option value="median">median</option>
            <option value="mean">mean</option>
            <option value="most_frequent">most_frequent</option>
          </select>
        </div>
      );
    case "train_test_split":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary">
            Размер тестовой выборки: {((params.test_size as number) ?? 0.2).toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={0.5}
            step={0.05}
            value={(params.test_size as number) ?? 0.2}
            onChange={(e) => onChange({ test_size: Number(e.target.value) })}
            className="accent-accent"
          />
        </div>
      );
    case "feature_select":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary">
            Количество признаков (k): {(params.k as number) ?? 10}
          </label>
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={(params.k as number) ?? 10}
            onChange={(e) => onChange({ k: Number(e.target.value) })}
            className="accent-accent"
          />
        </div>
      );
    case "pca":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary">
            Компоненты: {(params.n_components as number) ?? 5}
          </label>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={(params.n_components as number) ?? 5}
            onChange={(e) => onChange({ n_components: Number(e.target.value) })}
            className="accent-accent"
          />
        </div>
      );
    default:
      return <p className="text-[11px] text-text-muted">У этого блока нет настроек.</p>;
  }
}

function ModelFields({ nodeType }: { nodeType: PipelineNodeType }) {
  const ranges = MODEL_HYPERPARAM_RANGES[nodeType];
  if (!ranges) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-text-muted">
        Гиперпараметры подберёт Optuna автоматически:
      </p>
      {ranges.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-text-secondary">{r.label}</span>
          <span className="text-accent-text">{r.range}</span>
        </div>
      ))}
    </div>
  );
}

export function NodeSettings({ nodeId }: { nodeId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const node = usePipelineStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNodeParams = usePipelineStore((s) => s.updateNodeParams);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!node) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-surface3 text-text-secondary hover:text-text-primary text-xs"
      >
        ⚙️
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          onClick={(e) => e.stopPropagation()}
          className="nodrag absolute z-50 top-6 right-0 w-56 rounded border border-border bg-surface2 p-3 shadow-xl"
        >
          {node.data.category === "prep" ? (
            <PrepFields
              nodeType={node.data.nodeType}
              params={node.data.params}
              onChange={(p) => updateNodeParams(nodeId, p)}
            />
          ) : (
            <ModelFields nodeType={node.data.nodeType} />
          )}
        </motion.div>
      )}
    </div>
  );
}
