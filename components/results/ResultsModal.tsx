"use client";

import { useSession } from "next-auth/react";
import { motion, type Variants } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ModelComparison } from "@/components/results/ModelComparison";
import { OptunaChart } from "@/components/results/OptunaChart";
import { ShapChart } from "@/components/results/ShapChart";
import { GeneratedCode } from "@/components/results/GeneratedCode";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import { modelLabel, formatDuration, scoreColor } from "@/lib/utils";

const METRIC_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  f1: "F1",
  rmse: "RMSE",
  r2: "R²",
};

function downloadBase64(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function ResultsModal() {
  const { data: session } = useSession();
  const isPro = session?.user?.plan === "PRO";

  const open = usePipelineStore((s) => s.resultsModalOpen);
  const setOpen = usePipelineStore((s) => s.setResultsModalOpen);
  const result = usePipelineStore((s) => s.result);
  const pipelineName = usePipelineStore((s) => s.pipelineName);

  if (!result) return null;

  const metricName = METRIC_LABELS[result.metric_name] ?? result.metric_name;

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="w-full max-w-[800px] max-h-[85vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h2 className="text-lg font-semibold">Результаты пайплайна</h2>
          <p className="text-xs text-text-secondary">{pipelineName}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-text-secondary">
            {formatDuration(result.duration)}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface3 text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 flex flex-col gap-8">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-surface rounded-lg border border-border p-5 flex items-center justify-between gap-4"
        >
          <div>
            <div className="text-xs text-text-secondary mb-1">Лучшая модель</div>
            <div className="text-lg font-mono text-accent-text">
              {modelLabel(result.best_model)}
            </div>
          </div>
          <div className={`text-6xl font-mono font-semibold ${scoreColor(result.best_score)}`}>
            {(result.best_score * 100).toFixed(1)}%
          </div>
          <div className="text-right">
            <div className="text-xs text-text-secondary mb-1">Метрика</div>
            <div className="text-lg font-mono text-text-primary">{metricName}</div>
          </div>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
          <ModelComparison models={result.models} bestModel={result.best_model} />
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
          <OptunaChart history={result.optuna_history} bestParams={result.best_params} />
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
          <ShapChart shap={result.shap} isPro={isPro} />
        </motion.div>

        <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
          <GeneratedCode code={result.generated_code} />
        </motion.div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
        {isPro && result.model_binary ? (
          <Button
            variant="accent"
            onClick={() => downloadBase64(result.model_binary as string, `${pipelineName}.pkl`)}
          >
            Скачать модель .pkl
          </Button>
        ) : (
          <Button variant="ghost" disabled title="Доступно в PRO">
            🔒 Скачать модель .pkl
          </Button>
        )}
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
}
