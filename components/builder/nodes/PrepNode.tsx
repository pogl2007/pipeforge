"use client";

import type { NodeProps } from "reactflow";
import { NodeShell } from "./NodeShell";
import { NodeSettings } from "@/components/builder/NodeSettings";
import type { PipelineNodeData } from "@/types";

function paramsSummary(data: PipelineNodeData): string | null {
  const p = data.params;
  switch (data.nodeType) {
    case "imputer":
      return `strategy=${p.strategy ?? "median"}`;
    case "train_test_split":
      return `test_size=${p.test_size ?? 0.2}`;
    case "feature_select":
      return `k=${p.k ?? 10}`;
    case "pca":
      return `n_components=${p.n_components ?? 5}`;
    default:
      return null;
  }
}

export function PrepNode({ id, data, selected }: NodeProps<PipelineNodeData>) {
  const summary = paramsSummary(data);

  return (
    <NodeShell category="prep" hasInput hasOutput selected={selected} runState={data.runState}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{data.icon}</span>
          <span className="font-mono text-xs text-text-primary">{data.label}</span>
        </div>
        <NodeSettings nodeId={id} />
      </div>
      {summary && <div className="font-mono text-[10px] text-text-muted">{summary}</div>}
    </NodeShell>
  );
}
