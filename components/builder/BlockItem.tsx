"use client";

import type { BlockDef } from "@/types";

export function BlockItem({ block, locked }: { block: BlockDef; locked?: boolean }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/pipeforge-block", JSON.stringify(block));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-start gap-2 px-2 py-2 rounded cursor-grab active:cursor-grabbing hover:bg-surface3 transition-colors duration-150"
    >
      <span className="text-base leading-none mt-0.5">{block.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-text-primary truncate">{block.label}</span>
          {locked && <span className="text-[10px]">🔒</span>}
        </div>
        <div className="text-[10px] text-text-muted truncate">{block.description}</div>
      </div>
    </div>
  );
}
