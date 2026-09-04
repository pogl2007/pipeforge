"use client";

import { useSession } from "next-auth/react";
import type { NodeProps } from "reactflow";
import { NodeShell } from "./NodeShell";
import { NodeSettings } from "@/components/builder/NodeSettings";
import { findBlock } from "@/lib/blocks";
import type { PipelineNodeData } from "@/types";

export function ModelNode({ id, data, selected }: NodeProps<PipelineNodeData>) {
  const { data: session } = useSession();
  const plan = session?.user?.plan ?? "FREE";
  const block = findBlock(data.nodeType);
  const isLocked = block?.pro && plan === "FREE";

  return (
    <NodeShell category="model" hasInput hasOutput selected={selected} runState={data.runState}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{data.icon}</span>
          <span className="font-mono text-xs text-text-primary">{data.label}</span>
          {isLocked && <span className="text-xs">🔒</span>}
        </div>
        {!isLocked && <NodeSettings nodeId={id} />}
      </div>
      <div className="font-mono text-[10px] text-text-muted">
        {isLocked ? "Доступно в PRO" : "Гиперпараметры подберёт Optuna"}
      </div>
    </NodeShell>
  );
}
