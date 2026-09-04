import { findBlock } from "@/lib/blocks";
import type { PipelineGraph } from "@/types";

const CATEGORY_COLOR: Record<string, string> = {
  data: "#38bdf8",
  prep: "#a3e635",
  model: "#fdba74",
  eval: "#c084fc",
};

export function PipelineMiniPreview({ graph }: { graph: PipelineGraph }) {
  if (!graph.nodes.length) {
    return (
      <div className="h-16 flex items-center justify-center text-text-muted text-xs">
        Пусто
      </div>
    );
  }

  const xs = graph.nodes.map((n) => n.position.x);
  const ys = graph.nodes.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const normalize = (x: number, y: number) => ({
    x: 10 + ((x - minX) / rangeX) * 180,
    y: 8 + ((y - minY) / rangeY) * 48,
  });

  return (
    <svg viewBox="0 0 200 64" className="w-full h-16">
      {graph.edges.map((e) => {
        const source = graph.nodes.find((n) => n.id === e.source);
        const target = graph.nodes.find((n) => n.id === e.target);
        if (!source || !target) return null;
        const a = normalize(source.position.x, source.position.y);
        const b = normalize(target.position.x, target.position.y);
        return (
          <line
            key={e.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#3d3020"
            strokeWidth={1}
          />
        );
      })}
      {graph.nodes.map((n) => {
        const pos = normalize(n.position.x, n.position.y);
        const block = findBlock(n.data.nodeType);
        return (
          <circle
            key={n.id}
            cx={pos.x}
            cy={pos.y}
            r={4}
            fill={CATEGORY_COLOR[block?.category ?? "data"]}
          />
        );
      })}
    </svg>
  );
}
