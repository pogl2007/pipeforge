import type { Node, Edge } from "reactflow";
import type { PipelineNodeData } from "@/types";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export function buildChecklist(nodes: Node<PipelineNodeData>[]): ChecklistItem[] {
  const hasData = nodes.some((n) => n.data.category === "data");
  const hasPrep = nodes.some((n) => n.data.category === "prep");
  const hasModel = nodes.some((n) => n.data.category === "model");
  const hasEval = nodes.some((n) => n.data.category === "eval");

  return [
    { label: "Есть источник данных", done: hasData },
    { label: "Есть хотя бы один препроцессинг", done: hasPrep },
    { label: "Есть модель", done: hasModel },
    { label: "Есть блок оценки", done: hasEval },
  ];
}

export function isGraphRunnable(nodes: Node<PipelineNodeData>[]): boolean {
  return buildChecklist(nodes).every((item) => item.done);
}

export function validateConnectivity(
  nodes: Node<PipelineNodeData>[],
  edges: Edge[]
): string[] {
  const errors: string[] = [];
  const connectedIds = new Set<string>();
  edges.forEach((e) => {
    connectedIds.add(e.source);
    connectedIds.add(e.target);
  });

  nodes.forEach((n) => {
    if (nodes.length > 1 && !connectedIds.has(n.id)) {
      errors.push(`Блок «${n.data.label}» не подключён к пайплайну`);
    }
  });

  return errors;
}
