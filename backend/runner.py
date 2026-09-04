import base64
import io
import pickle
import time
from typing import Any

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from datasets import load_dataset_for_node
from evaluator import compute_shap, evaluate_pipeline, generate_code, primary_score
from graph_parser import ParsedGraph, build_preprocessing_steps, parse_graph
from optimizer import build_model, optimize_model
from models import PipelineEdge, PipelineNode

MAX_ROWS = 3000
PLAN_TRIALS = {"free": 10, "pro": 50}


def maybe_subsample(X: pd.DataFrame, y: pd.Series, task_type: str) -> tuple[pd.DataFrame, pd.Series]:
    if len(X) <= MAX_ROWS:
        return X, y

    stratify = y if task_type == "classification" and y.nunique() > 1 else None
    X_sub, _, y_sub, _ = train_test_split(
        X, y, train_size=MAX_ROWS, random_state=42, stratify=stratify
    )
    return X_sub, y_sub


def train_one_model(
    node: PipelineNode,
    preprocessing_steps: list[tuple[str, Any]],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    task_type: str,
    n_trials: int,
) -> dict[str, Any]:
    model_type = node.data.nodeType
    best_params, history = optimize_model(
        model_type, preprocessing_steps, X_train, y_train, n_trials, task_type
    )

    model = build_model(model_type, best_params, task_type)
    pipeline = Pipeline(preprocessing_steps + [("model", model)])
    pipeline.fit(X_train, y_train)

    metrics = evaluate_pipeline(pipeline, X_test, y_test, task_type)
    score = primary_score(metrics, task_type)

    return {
        "node_id": node.id,
        "model_type": model_type,
        "best_params": best_params,
        "history": history,
        "pipeline": pipeline,
        "metrics": metrics,
        "score": score,
    }


def run_pipeline(
    nodes: list[PipelineNode], edges: list[PipelineEdge], plan: str
) -> dict[str, Any]:
    start = time.time()
    parsed: ParsedGraph = parse_graph(nodes, edges)

    if parsed.data_node is None:
        raise ValueError("В графе отсутствует источник данных")
    if not parsed.model_nodes:
        raise ValueError("В графе отсутствует хотя бы одна модель")

    X, y, inferred_task_type = load_dataset_for_node(
        parsed.data_node.data.nodeType, parsed.data_node.data.params
    )
    X, y = maybe_subsample(X, y, inferred_task_type)

    task_type = inferred_task_type
    stratify = y if task_type == "classification" and y.nunique() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=parsed.test_size, random_state=42, stratify=stratify
    )

    preprocessing_steps = build_preprocessing_steps(X_train, parsed, task_type)
    n_trials = PLAN_TRIALS.get(plan, 10)

    allowed_models = parsed.model_nodes
    if plan == "pro" and len(allowed_models) > 1:
        results = joblib.Parallel(n_jobs=min(4, len(allowed_models)), prefer="threads")(
            joblib.delayed(train_one_model)(
                node, preprocessing_steps, X_train, y_train, X_test, y_test, task_type, n_trials
            )
            for node in allowed_models
        )
    else:
        results = [
            train_one_model(
                node, preprocessing_steps, X_train, y_train, X_test, y_test, task_type, n_trials
            )
            for node in allowed_models
        ]

    results.sort(key=lambda r: r["score"], reverse=True)
    best = results[0]

    shap_values = None
    if "shap" in parsed.eval_types and plan == "pro":
        try:
            shap_values = compute_shap(best["pipeline"], X_test, best["model_type"])
        except Exception:
            shap_values = None

    generated_code = generate_code(
        model_type=best["model_type"],
        best_params=best["best_params"],
        task_type=task_type,
        has_scaler=parsed.has_scaler,
        has_encoder=parsed.has_encoder,
        feature_select_k=parsed.feature_select_k,
        pca_components=parsed.pca_components,
    )

    model_binary = None
    if plan == "pro":
        buffer = io.BytesIO()
        pickle.dump(best["pipeline"], buffer)
        model_binary = base64.b64encode(buffer.getvalue()).decode("ascii")

    metric_name = "accuracy" if task_type == "classification" else "r2"

    models_out = [
        {
            "name": r["model_type"],
            "type": r["model_type"],
            **r["metrics"],
        }
        for r in results
    ]

    duration = time.time() - start

    return {
        "status": "completed",
        "duration": duration,
        "best_model": best["model_type"],
        "best_score": best["score"],
        "metric_name": metric_name,
        "task_type": task_type,
        "best_params": best["best_params"],
        "models": models_out,
        "optuna_history": best["history"],
        "shap": shap_values,
        "generated_code": generated_code,
        "model_binary": model_binary,
    }
