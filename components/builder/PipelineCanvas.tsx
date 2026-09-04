"use client";

import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import { DataNode } from "@/components/builder/nodes/DataNode";
import { PrepNode } from "@/components/builder/nodes/PrepNode";
import { ModelNode } from "@/components/builder/nodes/ModelNode";
import { EvalNode } from "@/components/builder/nodes/EvalNode";
import { DeletableEdge } from "@/components/builder/edges/DeletableEdge";
import type { BlockDef } from "@/types";

const nodeTypes = {
  dataNode: DataNode,
  prepNode: PrepNode,
  modelNode: ModelNode,
  evalNode: EvalNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = usePipelineStore((s) => s.nodes);
  const edges = usePipelineStore((s) => s.edges);
  const onNodesChange = usePipelineStore((s) => s.onNodesChange);
  const onEdgesChange = usePipelineStore((s) => s.onEdgesChange);
  const onConnect = usePipelineStore((s) => s.onConnect);
  const addNodeFromBlock = usePipelineStore((s) => s.addNodeFromBlock);
  const status = usePipelineStore((s) => s.status);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/pipeforge-block");
      if (!raw) return;
      const block = JSON.parse(raw) as BlockDef;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNodeFromBlock(block, position);
    },
    [screenToFlowPosition, addNodeFromBlock]
  );

  return (
    <div ref={wrapperRef} className="flex-1 h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "deletable", animated: status === "RUNNING" }}
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#2a2218" />
        <Controls
          position="bottom-right"
          className="!bg-surface2 !border !border-border !shadow-lg [&>button]:!bg-surface2 [&>button]:!border-border [&>button]:!text-text-primary [&>button:hover]:!bg-surface3"
        />
        <MiniMap
          position="bottom-right"
          style={{ marginBottom: 120 }}
          maskColor="rgba(12,10,8,0.7)"
          nodeColor="#3d3020"
          className="!bg-surface2 !border !border-border"
        />
      </ReactFlow>
    </div>
  );
}

export function PipelineCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
