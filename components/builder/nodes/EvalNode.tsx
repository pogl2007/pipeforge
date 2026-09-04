"use client";

import { useSession } from "next-auth/react";
import type { NodeProps } from "reactflow";
import { NodeShell } from "./NodeShell";
import type { PipelineNodeData } from "@/types";

export function EvalNode({ data, selected }: NodeProps<PipelineNodeData>) {
  const { data: session } = useSession();
  const plan = session?.user?.plan ?? "FREE";
  const isLocked = data.nodeType === "shap" && plan === "FREE";

  return (
    <NodeShell category="eval" hasInput hasOutput={false} selected={selected} runState={data.runState}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{data.icon}</span>
        <span className="font-mono text-xs text-text-primary">{data.label}</span>
        {isLocked && <span className="text-xs">🔒</span>}
      </div>
      {isLocked && <div className="font-mono text-[10px] text-text-muted">Доступно в PRO</div>}
    </NodeShell>
  );
}
