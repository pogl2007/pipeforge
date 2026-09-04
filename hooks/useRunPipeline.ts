"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import type { PipelineGraph, RunResult } from "@/types";

function graphFromStore(
  nodes: ReturnType<typeof usePipelineStore.getState>["nodes"],
  edges: ReturnType<typeof usePipelineStore.getState>["edges"]
): PipelineGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as PipelineGraph["nodes"][number]["type"],
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  };
}

export function useRunPipeline() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const nodes = usePipelineStore((s) => s.nodes);
  const edges = usePipelineStore((s) => s.edges);
  const pipelineId = usePipelineStore((s) => s.pipelineId);
  const pipelineName = usePipelineStore((s) => s.pipelineName);
  const setPipelineId = usePipelineStore((s) => s.setPipelineId);
  const setStatus = usePipelineStore((s) => s.setStatus);
  const setResult = usePipelineStore((s) => s.setResult);
  const setResultsModalOpen = usePipelineStore((s) => s.setResultsModalOpen);
  const setNodeRunStates = usePipelineStore((s) => s.setNodeRunStates);
  const resetRunStates = usePipelineStore((s) => s.resetRunStates);

  const run = useCallback(async () => {
    setError(null);
    setStatus("RUNNING");
    resetRunStates();
    setNodeRunStates(Object.fromEntries(nodes.map((n) => [n.id, "running"])));

    try {
      let id = pipelineId;
      if (!id) {
        const createRes = await fetch("/api/pipelines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pipelineName,
            graph: graphFromStore(nodes, edges),
          }),
        });
        const created = await createRes.json();
        id = created.pipelineId;
        setPipelineId(id);
      } else {
        await fetch(`/api/pipelines/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pipelineName,
            graph: graphFromStore(nodes, edges),
          }),
        });
      }

      const runRes = await fetch(`/api/pipelines/${id}/run`, { method: "POST" });
      const data = await runRes.json();

      if (!runRes.ok) {
        setStatus("FAILED");
        setNodeRunStates(Object.fromEntries(nodes.map((n) => [n.id, "error"])));
        setError(data.error ?? "Не удалось обучить пайплайн");
        return;
      }

      const result = data as RunResult;
      setResult(result);
      setStatus(result.status === "completed" ? "COMPLETED" : "FAILED");
      setNodeRunStates(
        Object.fromEntries(nodes.map((n) => [n.id, result.status === "completed" ? "done" : "error"]))
      );
      setResultsModalOpen(true);
    } catch {
      setStatus("FAILED");
      setNodeRunStates(Object.fromEntries(nodes.map((n) => [n.id, "error"])));
      setError("Не удалось связаться с сервером");
    }
  }, [
    nodes,
    edges,
    pipelineId,
    pipelineName,
    session,
    setPipelineId,
    setStatus,
    setResult,
    setResultsModalOpen,
    setNodeRunStates,
    resetRunStates,
  ]);

  return { run, error };
}
