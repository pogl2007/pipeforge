import os
import uuid

import pandas as pd
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from datasets import BUILTIN_DATASETS, UPLOADS_DIR, dataframe_preview
from graph_parser import parse_graph, validate_graph
from models import (
    GraphValidationResponse,
    RunRequest,
    RunResponse,
    UploadResponse,
    ValidateRequest,
)
from runner import run_pipeline

app = FastAPI(title="PipeForge ML Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pipeforge.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FREE_MODELS = {"xgboost", "randomforest", "linear_model"}

# Shared secret between the Next.js server and this backend. Without it,
# anyone who discovers this service's public URL could call /run directly
# with plan="pro" and get unlimited training, bypassing every plan/quota
# check the Next.js layer enforces. Only the Next.js server (never the
# browser) knows this value, so it must be set via env vars in both places.
INTERNAL_API_SECRET = os.environ.get(
    "INTERNAL_API_SECRET", "dev-only-shared-secret-change-me"
)
MAX_UPLOAD_BYTES = 20 * 1024 * 1024


def verify_internal_secret(x_internal_secret: str | None = Header(default=None)):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=401, detail="Недействительный внутренний ключ")


@app.get("/")
def root():
    return {"service": "pipeforge-backend", "status": "ok"}


@app.post("/run", response_model=RunResponse, dependencies=[Depends(verify_internal_secret)])
def run(request: RunRequest):
    errors = validate_graph(request.graph.nodes, request.graph.edges)
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    parsed = parse_graph(request.graph.nodes, request.graph.edges)

    if request.plan == "free":
        disallowed = [
            n.data.nodeType for n in parsed.model_nodes if n.data.nodeType not in FREE_MODELS
        ]
        if disallowed:
            raise HTTPException(
                status_code=403,
                detail=f"Модели недоступны на тарифе FREE: {', '.join(set(disallowed))}",
            )
        if "shap" in parsed.eval_types:
            # SHAP просто не будет посчитан на FREE — не блокируем запуск целиком
            pass

    try:
        result = run_pipeline(request.graph.nodes, request.graph.edges, request.plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обучения: {e}")

    return result


@app.post("/validate-graph", response_model=GraphValidationResponse)
def validate(request: ValidateRequest):
    errors = validate_graph(request.nodes, request.edges)
    return {"valid": len(errors) == 0, "errors": errors}


@app.get("/datasets")
def datasets():
    return {"datasets": BUILTIN_DATASETS}


@app.post("/upload-dataset", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".csv", ".xlsx", ".xls"):
        raise HTTPException(status_code=400, detail="Поддерживаются только .csv и .xlsx файлы")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413, detail="Файл слишком большой (максимум 20 МБ)"
        )

    file_id = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOADS_DIR, file_id)

    with open(path, "wb") as f:
        f.write(content)

    try:
        if ext in (".xlsx", ".xls"):
            df = pd.read_excel(path)
        else:
            df = pd.read_csv(path)
    except Exception as e:
        os.remove(path)
        raise HTTPException(status_code=400, detail=f"Не удалось прочитать файл: {e}")

    preview = dataframe_preview(df)
    return {**preview, "file_id": file_id}
