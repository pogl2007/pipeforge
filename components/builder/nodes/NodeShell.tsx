"use client";

import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { NodeCategory, NodeRunState } from "@/types";

const CATEGORY_BG: Record<NodeCategory, string> = {
  data: "bg-node-data",
  prep: "bg-node-prep",
  model: "bg-node-model",
  eval: "bg-node-eval",
};

const CATEGORY_BADGE_VARIANT: Record<NodeCategory, "data" | "prep" | "model" | "eval"> = {
  data: "data",
  prep: "prep",
  model: "model",
  eval: "eval",
};

function stateBorderClass(state?: NodeRunState) {
  switch (state) {
    case "running":
      return "border-accent animate-pulse-glow";
    case "done":
      return "border-success";
    case "error":
      return "border-danger";
    default:
      return "border-border-strong";
  }
}

export function NodeShell({
  category,
  hasInput,
  hasOutput,
  runState,
  selected,
  children,
}: {
  category: NodeCategory;
  hasInput: boolean;
  hasOutput: boolean;
  runState?: NodeRunState;
  selected?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-[200px] rounded-lg border-2 p-3 shadow-lg transition-colors duration-200",
        CATEGORY_BG[category],
        stateBorderClass(runState),
        selected && "ring-2 ring-accent/50"
      )}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#f5f0e8", border: "2px solid #0c0a08" }}
        />
      )}

      <div className="flex items-center justify-between mb-2">
        <Badge variant={CATEGORY_BADGE_VARIANT[category]}>{category}</Badge>
        {runState === "done" && <span className="text-success text-xs">✓</span>}
        {runState === "error" && <span className="text-danger text-xs">✕</span>}
      </div>

      {children}

      {hasOutput && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}
