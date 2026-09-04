import type { PipelineGraph, RunResult, GraphValidation } from "@/types";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";
const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET ?? "dev-only-shared-secret-change-me";

export async function runPipelineOnBackend(
  graph: PipelineGraph,
  userId: string,
  plan: "free" | "pro"
): Promise<RunResult> {
  const res = await fetch(`${FASTAPI_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_API_SECRET,
    },
    body: JSON.stringify({ graph, user_id: userId, plan }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FastAPI /run failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function validateGraphOnBackend(
  graph: PipelineGraph
): Promise<GraphValidation> {
  const res = await fetch(`${FASTAPI_URL}/validate-graph`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graph),
    cache: "no-store",
  });

  if (!res.ok) {
    return { valid: false, errors: ["Не удалось связаться с сервером обучения"] };
  }

  return res.json();
}

export async function fetchDatasetsFromBackend() {
  const res = await fetch(`${FASTAPI_URL}/datasets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось получить список датасетов");
  return res.json();
}

export async function uploadDatasetToBackend(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${FASTAPI_URL}/upload-dataset`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Не удалось загрузить файл");
  return res.json();
}
