from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_squared_error,
    r2_score,
)
from sklearn.pipeline import Pipeline

TREE_MODELS = {"xgboost", "lightgbm", "catboost", "randomforest"}


def evaluate_pipeline(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    task_type: str,
) -> dict[str, float]:
    y_pred = pipeline.predict(X_test)

    if task_type == "classification":
        return {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "f1": float(f1_score(y_test, y_pred, average="weighted")),
        }

    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    return {
        "rmse": rmse,
        "r2": float(r2_score(y_test, y_pred)),
    }


def primary_score(metrics: dict[str, float], task_type: str) -> float:
    if task_type == "classification":
        return metrics["accuracy"]
    return max(metrics["r2"], 0.0)


def get_feature_names(pipeline: Pipeline) -> list[str]:
    try:
        preprocessor = pipeline.named_steps.get("preprocessor")
        if preprocessor is not None:
            names = list(preprocessor.get_feature_names_out())
            if "feature_select" in pipeline.named_steps:
                mask = pipeline.named_steps["feature_select"].get_support()
                names = [n for n, keep in zip(names, mask) if keep]
            if "pca" in pipeline.named_steps:
                n_components = pipeline.named_steps["pca"].n_components_
                names = [f"pca_component_{i + 1}" for i in range(n_components)]
            return names
    except Exception:
        pass
    return [f"feature_{i}" for i in range(20)]


def compute_shap(
    pipeline: Pipeline, X_test: pd.DataFrame, model_type: str
) -> list[dict[str, Any]]:
    import shap

    model = pipeline.named_steps["model"]
    transform_steps = Pipeline(pipeline.steps[:-1])
    X_transformed = transform_steps.transform(X_test)

    sample = X_transformed[: min(100, X_transformed.shape[0])]

    if model_type in TREE_MODELS:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(sample)
    else:
        background = sample[: min(30, sample.shape[0])]
        explainer = shap.KernelExplainer(model.predict, background)
        shap_values = explainer.shap_values(sample, nsamples=50)

    if isinstance(shap_values, list):
        # Older SHAP API: one array per class — take the positive/last class.
        shap_values = shap_values[-1]
    shap_values = np.array(shap_values)
    if shap_values.ndim > 2:
        # Newer SHAP API: shape (n_samples, n_features, n_classes). For binary
        # classification class contributions are mirror images of each other,
        # so averaging across classes would cancel out to ~0 — pick the
        # positive/last class instead.
        shap_values = shap_values[..., -1]

    importance = np.abs(shap_values).mean(axis=0)
    signed = shap_values.mean(axis=0)
    feature_names = get_feature_names(pipeline)

    n = min(len(feature_names), len(importance))
    results = [
        {"feature": feature_names[i], "importance": float(np.sign(signed[i]) * importance[i])}
        for i in range(n)
    ]
    results.sort(key=lambda r: abs(r["importance"]), reverse=True)
    return results[:15]


PIPELINE_STEP_IMPORT = {
    "SimpleImputer": "from sklearn.impute import SimpleImputer",
    "StandardScaler": "from sklearn.preprocessing import StandardScaler",
    "OneHotEncoder": "from sklearn.preprocessing import OneHotEncoder",
    "SafeSelectKBest": "from sklearn.feature_selection import SelectKBest",
    "SafePCA": "from sklearn.decomposition import PCA",
    "ColumnTransformer": "from sklearn.compose import ColumnTransformer",
}

MODEL_IMPORT_AND_CODE = {
    "xgboost": ("from xgboost import XGBClassifier", "XGBClassifier"),
    "randomforest": ("from sklearn.ensemble import RandomForestClassifier", "RandomForestClassifier"),
    "linear_model": ("from sklearn.linear_model import LogisticRegression", "LogisticRegression"),
    "lightgbm": ("from lightgbm import LGBMClassifier", "LGBMClassifier"),
    "catboost": ("from catboost import CatBoostClassifier", "CatBoostClassifier"),
    "svm": ("from sklearn.svm import SVC", "SVC"),
    "knn": ("from sklearn.neighbors import KNeighborsClassifier", "KNeighborsClassifier"),
    "mlp": ("from sklearn.neural_network import MLPClassifier", "MLPClassifier"),
}


def generate_code(
    model_type: str,
    best_params: dict[str, Any],
    task_type: str,
    has_scaler: bool,
    has_encoder: bool,
    feature_select_k: int | None,
    pca_components: int | None,
) -> str:
    import_line, class_name = MODEL_IMPORT_AND_CODE.get(
        model_type, ("from sklearn.ensemble import RandomForestClassifier", "RandomForestClassifier")
    )
    if task_type == "regression":
        # Most model names follow the Classifier/Regressor convention, but
        # LogisticRegression->Ridge and SVC->SVR don't — handle them explicitly.
        class_name = (
            class_name.replace("Classifier", "Regressor")
            .replace("LogisticRegression", "Ridge")
            .replace("SVC", "SVR")
        )
        import_line = (
            import_line.replace("Classifier", "Regressor")
            .replace(
                "from sklearn.linear_model import LogisticRegression",
                "from sklearn.linear_model import Ridge",
            )
            .replace("from sklearn.svm import SVC", "from sklearn.svm import SVR")
        )

    # best_params mirrors the Optuna search space, which doesn't always match
    # the constructor kwargs 1:1 (e.g. linear_model tunes "alpha" but
    # LogisticRegression takes "C") — translate + add the fixed kwargs the
    # real training run used, so the generated snippet actually reproduces it.
    code_params: dict[str, Any] = dict(best_params)
    fixed_kwargs: dict[str, Any] = {"random_state": 42}

    if model_type == "linear_model":
        alpha = code_params.pop("alpha", 1.0)
        if task_type == "classification":
            code_params = {"C": 1 / max(alpha, 1e-4)}
            fixed_kwargs = {"max_iter": 2000}
        else:
            code_params = {"alpha": alpha}
    elif model_type == "xgboost":
        fixed_kwargs["eval_metric"] = "logloss" if task_type == "classification" else "rmse"
    elif model_type == "svm":
        # SVR (regression) doesn't accept random_state at all; SVC does.
        fixed_kwargs = {"probability": True, "random_state": 42} if task_type == "classification" else {}
    elif model_type == "mlp":
        fixed_kwargs["max_iter"] = 500
    elif model_type in ("lightgbm", "catboost"):
        fixed_kwargs = {"random_state": 42, "verbose": -1 if model_type == "lightgbm" else False}
    elif model_type == "knn":
        # KNeighbors{Classifier,Regressor} don't accept random_state either.
        fixed_kwargs = {}

    all_params = {**code_params, **fixed_kwargs}
    params_str = ", ".join(f"{k}={v!r}" for k, v in all_params.items())

    lines = [
        "import pandas as pd",
        "from sklearn.compose import ColumnTransformer",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.impute import SimpleImputer",
    ]
    if has_scaler:
        lines.append("from sklearn.preprocessing import StandardScaler")
    if has_encoder:
        lines.append("from sklearn.preprocessing import OneHotEncoder")
    if feature_select_k:
        lines.append("from sklearn.feature_selection import SelectKBest, f_classif")
    if pca_components:
        lines.append("from sklearn.decomposition import PCA")
    lines.append(import_line)
    lines.append("")

    lines.append("numeric_cols = X.select_dtypes(include='number').columns.tolist()")
    lines.append("categorical_cols = X.select_dtypes(exclude='number').columns.tolist()")
    lines.append("")

    numeric_steps = ["('imputer', SimpleImputer(strategy='median'))"]
    if has_scaler:
        numeric_steps.append("('scaler', StandardScaler())")
    lines.append(f"numeric_pipeline = Pipeline([{', '.join(numeric_steps)}])")

    if has_encoder:
        lines.append(
            "categorical_pipeline = Pipeline(["
            "('imputer', SimpleImputer(strategy='most_frequent')), "
            "('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))])"
        )
        cat_transformer = "('cat', categorical_pipeline, categorical_cols)"
    else:
        lines.append(
            "categorical_pipeline = Pipeline([('imputer', SimpleImputer(strategy='most_frequent'))])"
        )
        cat_transformer = "('cat', categorical_pipeline, categorical_cols)"

    lines.append(
        "preprocessor = ColumnTransformer(["
        "('num', numeric_pipeline, numeric_cols), "
        f"{cat_transformer}])"
    )
    lines.append("")

    steps = ["('preprocessor', preprocessor)"]
    if feature_select_k:
        steps.append(f"('feature_select', SelectKBest(score_func=f_classif, k={feature_select_k}))")
    if pca_components:
        steps.append(f"('pca', PCA(n_components={pca_components}))")
    steps.append(f"('model', {class_name}({params_str}))")

    lines.append("pipeline = Pipeline([")
    for step in steps:
        lines.append(f"    {step},")
    lines.append("])")
    lines.append("")
    lines.append("pipeline.fit(X_train, y_train)")
    lines.append("predictions = pipeline.predict(X_test)")

    return "\n".join(lines)
