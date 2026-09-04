"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/builder/Sidebar";
import { PipelineCanvas } from "@/components/builder/PipelineCanvas";
import { TopBar } from "@/components/builder/TopBar";
import { ResultsModal } from "@/components/results/ResultsModal";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import type { Pipeline } from "@/types";

export function BuilderLayout({ initialPipeline }: { initialPipeline?: Pipeline | null }) {
  const loadGraph = usePipelineStore((s) => s.loadGraph);
  const setPipelineId = usePipelineStore((s) => s.setPipelineId);
  const setPipelineName = usePipelineStore((s) => s.setPipelineName);
  const setStatus = usePipelineStore((s) => s.setStatus);
  const setResult = usePipelineStore((s) => s.setResult);

  useEffect(() => {
    if (!initialPipeline) return;
    loadGraph(
      initialPipeline.graph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      initialPipeline.graph.edges.map((e) => ({ ...e, type: "deletable" }))
    );
    setPipelineId(initialPipeline.id);
    setPipelineName(initialPipeline.name);
    setStatus(initialPipeline.status);
    setResult(initialPipeline.result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPipeline?.id]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-bg">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <PipelineCanvas />
      </div>
      <ResultsModal />
    </div>
  );
}
