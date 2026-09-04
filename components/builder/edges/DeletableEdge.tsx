"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "reactflow";
import { usePipelineStore } from "@/lib/store/pipelineStore";

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  animated,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const removeEdgeById = usePipelineStore((s) => s.onEdgesChange);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const handleDelete = () => {
    removeEdgeById([{ id, type: "remove" }]);
  };

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        strokeWidth={16}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: hovered ? "#f97316" : "#3d3020",
          strokeWidth: 1.5,
          strokeDasharray: animated ? "5 5" : undefined,
          animation: animated ? "dashmove 0.6s linear infinite" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        {hovered && (
          <button
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onClick={handleDelete}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-5 h-5 rounded-full bg-danger text-white text-xs flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            ×
          </button>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
