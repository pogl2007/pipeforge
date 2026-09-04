import os
import re
from typing import Any

import numpy as np
import pandas as pd
from sklearn.datasets import fetch_california_housing, load_iris

# Matches exactly what /upload-dataset generates: uuid4 hex + extension.
# Anything else (path separators, "..", absolute paths) is rejected outright
# so a client-supplied file_id can never escape UPLOADS_DIR.
FILE_ID_PATTERN = re.compile(r"^[0-9a-f]{32}\.(csv|xlsx|xls)$")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

BUILTIN_DATASETS = [
    {
        "type": "titanic",
        "label": "Titanic",
        "description": "Классификация: выживаемость пассажиров",
        "task_type": "classification",
    },
    {
        "type": "iris",
        "label": "Iris",
        "description": "Классификация: вид цветка ириса",
        "task_type": "classification",
    },
    {
        "type": "california_housing",
        "label": "California Housing",
        "description": "Регрессия: медианная стоимость жилья",
        "task_type": "regression",
    },
]


def load_titanic() -> tuple[pd.DataFrame, pd.Series, str]:
    df = pd.read_csv(os.path.join(DATASETS_DIR, "titanic.csv"))
    df = df.drop(columns=["PassengerId", "Name", "Ticket", "Cabin"])
    y = df["Survived"]
    X = df.drop(columns=["Survived"])
    return X, y, "classification"


def load_iris_dataset() -> tuple[pd.DataFrame, pd.Series, str]:
    data = load_iris(as_frame=True)
    X = data.data
    y = data.target
    return X, y, "classification"


def load_california_housing_dataset() -> tuple[pd.DataFrame, pd.Series, str]:
    data = fetch_california_housing(as_frame=True)
    X = data.data
    y = data.target
    return X, y, "regression"


def infer_task_type(y: pd.Series) -> str:
    if y.dtype == object or y.nunique() <= 20:
        return "classification"
    return "regression"


def load_uploaded(file_id: str, target_column: str) -> tuple[pd.DataFrame, pd.Series, str]:
    if not FILE_ID_PATTERN.match(file_id):
        raise ValueError("Недопустимый идентификатор файла")

    path = os.path.realpath(os.path.join(UPLOADS_DIR, file_id))
    uploads_real = os.path.realpath(UPLOADS_DIR)
    if os.path.commonpath([path, uploads_real]) != uploads_real:
        raise ValueError("Недопустимый идентификатор файла")
    if not os.path.isfile(path):
        raise ValueError("Файл не найден, загрузи его заново")

    if file_id.endswith((".xlsx", ".xls")):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    if target_column not in df.columns:
        target_column = df.columns[-1]

    y = df[target_column]
    X = df.drop(columns=[target_column])
    return X, y, infer_task_type(y)


def load_dataset_for_node(node_type: str, params: dict[str, Any]) -> tuple[pd.DataFrame, pd.Series, str]:
    if node_type == "titanic":
        return load_titanic()
    if node_type == "iris":
        return load_iris_dataset()
    if node_type == "california_housing":
        return load_california_housing_dataset()
    if node_type in ("csv_upload", "excel_upload"):
        file_id = params.get("file_id")
        target_column = params.get("target_column")
        if not file_id:
            raise ValueError("Файл не загружен для блока данных")
        return load_uploaded(file_id, target_column)
    raise ValueError(f"Неизвестный тип источника данных: {node_type}")


def dataframe_preview(df: pd.DataFrame, n: int = 5) -> dict[str, Any]:
    preview_df = df.head(n).replace({np.nan: None})
    return {
        "columns": list(df.columns),
        "preview": preview_df.values.tolist(),
        "shape": list(df.shape),
    }
