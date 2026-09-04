from typing import Any, Literal, Optional

from pydantic import BaseModel


class PipelineNodeData(BaseModel):
    category: Literal["data", "prep", "model", "eval"]
    nodeType: str
    label: str
    icon: str
    params: dict[str, Any] = {}
    runState: Optional[str] = None
    fileName: Optional[str] = None
    preview: Optional[dict[str, Any]] = None


class PipelineNode(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: PipelineNodeData


class PipelineEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: Optional[bool] = None


class PipelineGraph(BaseModel):
    nodes: list[PipelineNode]
    edges: list[PipelineEdge]


class RunRequest(BaseModel):
    graph: PipelineGraph
    user_id: str
    plan: Literal["free", "pro"]


class ValidateRequest(BaseModel):
    nodes: list[PipelineNode]
    edges: list[PipelineEdge]


class ModelResultOut(BaseModel):
    name: str
    type: str
    accuracy: Optional[float] = None
    f1: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None


class OptunaTrialOut(BaseModel):
    trial: int
    score: float


class ShapValueOut(BaseModel):
    feature: str
    importance: float


class RunResponse(BaseModel):
    status: Literal["completed", "failed"]
    duration: float
    best_model: str
    best_score: float
    metric_name: str
    task_type: Literal["classification", "regression"]
    best_params: dict[str, Any]
    models: list[ModelResultOut]
    optuna_history: list[OptunaTrialOut]
    shap: Optional[list[ShapValueOut]] = None
    generated_code: str
    model_binary: Optional[str] = None
    error: Optional[str] = None


class GraphValidationResponse(BaseModel):
    valid: bool
    errors: list[str]


class UploadResponse(BaseModel):
    columns: list[str]
    preview: list[list[Any]]
    shape: tuple[int, int]
    file_id: str
