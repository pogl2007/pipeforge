"use client";

import { usePipelineStore } from "@/lib/store/pipelineStore";
import { buildChecklist, isGraphRunnable } from "@/lib/graphValidation";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useRunPipeline } from "@/hooks/useRunPipeline";

export function RunButton() {
  const nodes = usePipelineStore((s) => s.nodes);
  const status = usePipelineStore((s) => s.status);
  const { run, error } = useRunPipeline();

  const checklist = buildChecklist(nodes);
  const runnable = isGraphRunnable(nodes);
  const running = status === "RUNNING";

  const button = (
    <Button
      variant="accent"
      size="md"
      disabled={!runnable || running}
      onClick={run}
    >
      {running ? "Обучается…" : "▶ Запустить"}
    </Button>
  );

  return (
    <div className="flex flex-col items-end gap-1">
      {!runnable ? (
        <Tooltip
          content={
            <ul className="flex flex-col gap-1.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className={item.done ? "text-success" : "text-text-muted"}>
                    {item.done ? "✓" : "○"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          }
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
