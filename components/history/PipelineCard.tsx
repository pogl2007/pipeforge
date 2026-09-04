"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PipelineMiniPreview } from "@/components/history/PipelineMiniPreview";
import { modelLabel, scoreColor } from "@/lib/utils";
import type { Pipeline } from "@/types";

const STATUS_VARIANT: Record<Pipeline["status"], "default" | "accent" | "success" | "danger"> = {
  DRAFT: "default",
  RUNNING: "accent",
  COMPLETED: "success",
  FAILED: "danger",
};

const STATUS_LABEL: Record<Pipeline["status"], string> = {
  DRAFT: "Draft",
  RUNNING: "Running",
  COMPLETED: "Done",
  FAILED: "Failed",
};

export function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Удалить пайплайн «${pipeline.name}»?`)) return;
    setDeleting(true);
    await fetch(`/api/pipelines/${pipeline.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm text-text-primary truncate">{pipeline.name}</h3>
        <Badge variant={STATUS_VARIANT[pipeline.status]}>{STATUS_LABEL[pipeline.status]}</Badge>
      </div>

      <PipelineMiniPreview graph={pipeline.graph} />

      {pipeline.bestScore !== null && (
        <div className="flex items-center justify-between">
          <span className={`font-mono text-2xl font-semibold ${scoreColor(pipeline.bestScore)}`}>
            {(pipeline.bestScore * 100).toFixed(1)}%
          </span>
          {pipeline.bestModel && <Badge variant="accent">{modelLabel(pipeline.bestModel)}</Badge>}
        </div>
      )}

      <div className="text-[11px] text-text-muted font-mono">
        {new Date(pipeline.createdAt).toLocaleDateString("ru-RU")}
        {pipeline.duration ? ` · ${pipeline.duration.toFixed(1)}с` : ""}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Link href={`/build?pipeline=${pipeline.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full">
            Открыть
          </Button>
        </Link>
        <Button variant="danger-ghost" size="sm" onClick={handleDelete} disabled={deleting}>
          Удалить
        </Button>
      </div>
    </Card>
  );
}
