"use client";

import { useRef, useState } from "react";
import type { NodeProps } from "reactflow";
import { NodeShell } from "./NodeShell";
import { usePipelineStore } from "@/lib/store/pipelineStore";
import { uploadDatasetToBackend } from "@/lib/api";
import type { PipelineNodeData } from "@/types";

const BUILTIN_SUBTITLE: Record<string, string> = {
  titanic: "titanic.csv",
  iris: "sklearn.datasets",
  california_housing: "sklearn.datasets",
};

export function DataNode({ id, data, selected }: NodeProps<PipelineNodeData>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const updateNodeData = usePipelineStore((s) => s.updateNodeData);
  const updateNodeParams = usePipelineStore((s) => s.updateNodeParams);

  const isUpload = data.nodeType === "csv_upload" || data.nodeType === "excel_upload";
  const subtitle = data.fileName ?? BUILTIN_SUBTITLE[data.nodeType] ?? "Выбери файл";

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadDatasetToBackend(file);
      updateNodeData(id, {
        fileName: file.name,
        preview: {
          columns: res.columns,
          rows: res.preview,
          shape: res.shape,
        },
      });
      updateNodeParams(id, {
        target_column: res.columns[res.columns.length - 1],
        file_id: res.file_id,
      });
    } catch {
      updateNodeData(id, { fileName: "Ошибка загрузки" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <NodeShell category="data" hasInput={false} hasOutput selected={selected} runState={data.runState}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{data.icon}</span>
        <span className="font-mono text-xs text-text-primary">{data.label}</span>
      </div>

      {isUpload ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="nodrag w-full text-left font-mono text-[10px] text-accent-text hover:underline truncate"
        >
          {uploading ? "Загрузка…" : subtitle}
        </button>
      ) : (
        <div className="font-mono text-[10px] text-text-muted">{subtitle}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={data.nodeType === "excel_upload" ? ".xlsx,.xls" : ".csv"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {data.preview && (
        <div className="mt-2 pt-2 border-t border-border-strong/50 overflow-hidden">
          <table className="w-full text-[9px] font-mono text-text-secondary">
            <thead>
              <tr>
                {data.preview.columns.slice(0, 3).map((c) => (
                  <th key={c} className="text-left font-normal text-text-muted truncate pr-1">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.preview.rows.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {row.slice(0, 3).map((cell, j) => (
                    <td key={j} className="truncate pr-1">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-text-muted mt-1">
            {data.preview.shape[0]} × {data.preview.shape[1]}
          </div>
          <select
            className="nodrag w-full mt-1.5 bg-surface border border-border rounded-sm px-1 py-1 text-[9px] font-mono text-text-primary"
            value={(data.params.target_column as string) ?? ""}
            onChange={(e) => updateNodeParams(id, { target_column: e.target.value })}
          >
            {data.preview.columns.map((c) => (
              <option key={c} value={c}>
                Целевая: {c}
              </option>
            ))}
          </select>
        </div>
      )}
    </NodeShell>
  );
}
