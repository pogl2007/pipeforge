from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any, Optional

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from models import PipelineEdge, PipelineNode

DATA_TYPES = {"csv_upload", "excel_upload", "titanic", "iris", "california_housing"}
PREP_TYPES = {"imputer", "scaler", "encoder", "train_test_split", "feature_select", "pca"}
MODEL_TYPES = {
    "xgboost",
    "randomforest",
    "linear_model",
    "lightgbm",
    "catboost",
    "svm",
    "knn",
    "mlp",
}
EVAL_TYPES = {"compare_models", "shap", "roc_curve", "confusion_matrix"}


@dataclass
class ParsedGraph:
    data_node: Optional[PipelineNode]
    prep_nodes: list[PipelineNode]
    model_nodes: list[PipelineNode]
    eval_types: set[str] = field(default_factory=set)

    @property
    def test_size(self) -> float:
        for node in self.prep_nodes:
            if node.data.nodeType == "train_test_split":
                return float(node.data.params.get("test_size", 0.2))
        return 0.2

    @property
    def imputer_strategy(self) -> Optional[str]:
        for node in self.prep_nodes:
            if node.data.nodeType == "imputer":
                return str(node.data.params.get("strategy", "median"))
        return None

    @property
    def has_scaler(self) -> bool:
        return any(n.data.nodeType == "scaler" for n in self.prep_nodes)

    @property
    def has_encoder(self) -> bool:
        return any(n.data.nodeType == "encoder" for n in self.prep_nodes)

    @property
    def feature_select_k(self) -> Optional[int]:
        for node in self.prep_nodes:
            if node.data.nodeType == "feature_select":
                return int(node.data.params.get("k", 10))
        return None

    @property
    def pca_components(self) -> Optional[int]:
        for node in self.prep_nodes:
            if node.data.nodeType == "pca":
                return int(node.data.params.get("n_components", 5))
        return None


def topological_sort(nodes: list[PipelineNode], edges: list[PipelineEdge]) -> list[PipelineNode]:
    node_by_id = {n.id: n for n in nodes}
    in_degree: dict[str, int] = {n.id: 0 for n in nodes}
    adjacency: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        if edge.source not in node_by_id or edge.target not in node_by_id:
            continue
        adjacency[edge.source].append(edge.target)
        in_degree[edge.target] += 1

    queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])
    order: list[PipelineNode] = []

    while queue:
        current = queue.popleft()
        order.append(node_by_id[current])
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) < len(nodes):
        seen_ids = {n.id for n in order}
        for node in nodes:
            if node.id not in seen_ids:
                order.append(node)

    return order


def parse_graph(nodes: list[PipelineNode], edges: list[PipelineEdge]) -> ParsedGraph:
    order = topological_sort(nodes, edges)

    data_node: Optional[PipelineNode] = None
    prep_nodes: list[PipelineNode] = []
    model_nodes: list[PipelineNode] = []
    eval_types: set[str] = set()

    for node in order:
        node_type = node.data.nodeType
        if node_type in DATA_TYPES:
            if data_node is None:
                data_node = node
        elif node_type in PREP_TYPES:
            prep_nodes.append(node)
        elif node_type in MODEL_TYPES:
            model_nodes.append(node)
        elif node_type in EVAL_TYPES:
            eval_types.add(node_type)

    return ParsedGraph(
        data_node=data_node,
        prep_nodes=prep_nodes,
        model_nodes=model_nodes,
        eval_types=eval_types,
    )


class SafeSelectKBest(SelectKBest):
    """Clamps k to the number of available features to avoid runtime errors
    when the user picks a k larger than what preprocessing produces."""

    def fit(self, X, y=None):
        n_features = X.shape[1]
        self.k = min(self.k, n_features)
        return super().fit(X, y)


class SafePCA(PCA):
    """Clamps n_components to min(n_samples, n_features)."""

    def fit(self, X, y=None):
        self.n_components = min(self.n_components, X.shape[0], X.shape[1])
        return super().fit(X, y)


def build_preprocessing_steps(
    X: pd.DataFrame, parsed: ParsedGraph, task_type: str
) -> list[tuple[str, Any]]:
    numeric_cols = X.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = X.select_dtypes(exclude=["number"]).columns.tolist()

    strategy = parsed.imputer_strategy or "median"

    numeric_steps: list[tuple[str, Any]] = [("imputer", SimpleImputer(strategy=strategy))]
    if parsed.has_scaler:
        numeric_steps.append(("scaler", StandardScaler()))

    categorical_steps: list[tuple[str, Any]] = [
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ]
    if parsed.has_encoder:
        categorical_steps.append(
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        )

    transformers = []
    if numeric_cols:
        transformers.append(("num", Pipeline(numeric_steps), numeric_cols))
    if categorical_cols:
        transformers.append(("cat", Pipeline(categorical_steps), categorical_cols))

    preprocessor = ColumnTransformer(transformers, remainder="drop")
    steps: list[tuple[str, Any]] = [("preprocessor", preprocessor)]

    k = parsed.feature_select_k
    if k is not None:
        score_func = f_classif if task_type == "classification" else f_regression
        steps.append(("feature_select", SafeSelectKBest(score_func=score_func, k=k)))

    n_components = parsed.pca_components
    if n_components is not None:
        steps.append(("pca", SafePCA(n_components=n_components)))

    return steps


def validate_graph(nodes: list[PipelineNode], edges: list[PipelineEdge]) -> list[str]:
    errors: list[str] = []
    parsed = parse_graph(nodes, edges)

    if parsed.data_node is None:
        errors.append("Добавь источник данных")
    if not parsed.prep_nodes:
        errors.append("Добавь хотя бы один блок препроцессинга")
    if not parsed.model_nodes:
        errors.append("Добавь хотя бы одну модель")
    if not parsed.eval_types:
        errors.append("Добавь блок оценки")

    return errors
