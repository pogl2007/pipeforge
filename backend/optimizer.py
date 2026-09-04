from typing import Any

import optuna
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC, SVR
from xgboost import XGBClassifier, XGBRegressor

optuna.logging.set_verbosity(optuna.logging.WARNING)

try:
    from lightgbm import LGBMClassifier, LGBMRegressor

    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    from catboost import CatBoostClassifier, CatBoostRegressor

    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False


def build_model(model_type: str, params: dict[str, Any], task_type: str):
    is_clf = task_type == "classification"

    if model_type == "xgboost":
        cls = XGBClassifier if is_clf else XGBRegressor
        return cls(**params, random_state=42, eval_metric="logloss" if is_clf else "rmse")

    if model_type == "randomforest":
        cls = RandomForestClassifier if is_clf else RandomForestRegressor
        return cls(**params, random_state=42)

    if model_type == "linear_model":
        if is_clf:
            return LogisticRegression(max_iter=2000, C=1 / max(params.get("alpha", 1.0), 1e-4))
        return Ridge(alpha=params.get("alpha", 1.0), random_state=42)

    if model_type == "lightgbm":
        if not HAS_LIGHTGBM:
            raise RuntimeError("LightGBM недоступен на сервере")
        cls = LGBMClassifier if is_clf else LGBMRegressor
        return cls(**params, random_state=42, verbose=-1)

    if model_type == "catboost":
        if not HAS_CATBOOST:
            raise RuntimeError("CatBoost недоступен на сервере")
        cls = CatBoostClassifier if is_clf else CatBoostRegressor
        return cls(**params, random_state=42, verbose=False)

    if model_type == "svm":
        if is_clf:
            return SVC(**params, probability=True, random_state=42)
        return SVR(**params)

    if model_type == "knn":
        cls = KNeighborsClassifier if is_clf else KNeighborsRegressor
        return cls(**params)

    if model_type == "mlp":
        cls = MLPClassifier if is_clf else MLPRegressor
        return cls(**params, random_state=42, max_iter=500)

    raise ValueError(f"Неизвестный тип модели: {model_type}")


def suggest_params(trial: optuna.Trial, model_type: str, task_type: str) -> dict[str, Any]:
    if model_type == "xgboost":
        return {
            "n_estimators": trial.suggest_int("n_estimators", 50, 500),
            "max_depth": trial.suggest_int("max_depth", 3, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        }
    if model_type == "randomforest":
        return {
            "n_estimators": trial.suggest_int("n_estimators", 50, 300),
            "max_depth": trial.suggest_int("max_depth", 3, 15),
            "min_samples_split": trial.suggest_int("min_samples_split", 2, 10),
        }
    if model_type == "linear_model":
        return {"alpha": trial.suggest_float("alpha", 0.0001, 10, log=True)}
    if model_type == "lightgbm":
        return {
            "n_estimators": trial.suggest_int("n_estimators", 50, 500),
            "num_leaves": trial.suggest_int("num_leaves", 20, 100),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        }
    if model_type == "catboost":
        return {
            "iterations": trial.suggest_int("iterations", 50, 500),
            "depth": trial.suggest_int("depth", 3, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        }
    if model_type == "svm":
        return {
            "C": trial.suggest_float("C", 0.1, 100, log=True),
            "kernel": trial.suggest_categorical("kernel", ["rbf", "linear", "poly"]),
        }
    if model_type == "knn":
        return {"n_neighbors": trial.suggest_int("n_neighbors", 3, 20)}
    if model_type == "mlp":
        layers = trial.suggest_categorical(
            "hidden_layer_sizes", ["32", "64", "128", "64,32", "128,64"]
        )
        return {
            "hidden_layer_sizes": tuple(int(x) for x in layers.split(",")),
            "learning_rate_init": trial.suggest_float("learning_rate_init", 0.0001, 0.01, log=True),
        }
    raise ValueError(f"Неизвестный тип модели: {model_type}")


def optimize_model(
    model_type: str,
    preprocessing_steps: list[tuple[str, Any]],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    n_trials: int,
    task_type: str,
    n_jobs: int = 1,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    history: list[dict[str, Any]] = []
    scoring = "accuracy" if task_type == "classification" else "r2"

    def objective(trial: optuna.Trial) -> float:
        params = suggest_params(trial, model_type, task_type)
        model = build_model(model_type, params, task_type)
        pipeline = Pipeline(preprocessing_steps + [("model", model)])

        try:
            cv = 3 if len(X_train) < 200 else 5
            score = cross_val_score(
                pipeline, X_train, y_train, cv=cv, scoring=scoring, n_jobs=1
            ).mean()
        except Exception:
            score = -1.0 if task_type == "regression" else 0.0

        history.append({"trial": trial.number + 1, "score": float(score)})
        return score

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False, n_jobs=n_jobs)

    best_params = dict(study.best_params)
    if model_type == "mlp" and "hidden_layer_sizes" in best_params:
        best_params["hidden_layer_sizes"] = tuple(
            int(x) for x in best_params["hidden_layer_sizes"].split(",")
        )

    return best_params, history
