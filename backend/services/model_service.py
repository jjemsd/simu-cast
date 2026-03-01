"""
Step 2 – Predictive Modeling service.

Handles model evaluation (comparing all models) and final model training
using scikit-learn. Supports both classification and regression tasks.
"""

import time
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.ensemble import (
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC, SVR


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize(s: str) -> str:
    return s.lower().replace("_", " ").replace("/", " ").strip()


def find_target_column(df: pd.DataFrame, label: str) -> str:
    """
    Match a user-provided label to an actual column name in the DataFrame.
    Tries exact match, then partial/substring match, then falls back to
    the last numeric column.
    """
    norm_label = _normalize(label)

    # Exact match
    for col in df.columns:
        if _normalize(col) == norm_label:
            return col

    # Partial match
    for col in df.columns:
        if norm_label in _normalize(col) or _normalize(col) in norm_label:
            return col

    # Word-overlap fallback
    label_words = set(norm_label.split())
    for col in df.columns:
        if label_words & set(_normalize(col).split()):
            return col

    # Last resort: last numeric column
    num_cols = df.select_dtypes(include=[np.number]).columns
    return num_cols[-1] if len(num_cols) else df.columns[-1]


# ---------------------------------------------------------------------------
# Feature configuration – replaces the old hardcoded _PARAM_PATTERNS mapping
# ---------------------------------------------------------------------------

def get_feature_config(df: pd.DataFrame, feature_cols: List[str]) -> Dict[str, Dict]:
    """
    Return statistical metadata for every feature column.

    Schema per column:
        {
            "min":  float,
            "max":  float,
            "mean": float,
            "std":  float,
        }

    This drives the scenario sliders dynamically so they always reflect
    the actual uploaded dataset rather than any hardcoded domain values.
    """
    config: Dict[str, Dict] = {}
    for col in feature_cols:
        series = df[col].dropna()
        config[col] = {
            "min": float(series.min()),
            "max": float(series.max()),
            "mean": float(series.mean()),
            "std": float(series.std()) if len(series) > 1 else 0.0,
        }
    return config


# ---------------------------------------------------------------------------
# Data preparation
# ---------------------------------------------------------------------------

def prepare_data(
    df: pd.DataFrame, target_col: str, task_type: str
) -> Tuple[pd.DataFrame, Any, List[str], Optional[LabelEncoder]]:
    """
    Split DataFrame into X (features) and y (target).

    Returns (X, y, feature_cols, label_encoder).
    label_encoder is only set for classification tasks.
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    feature_cols = [c for c in numeric_cols if c != target_col]

    if not feature_cols:
        raise ValueError("No numeric feature columns found after excluding the target.")

    X = df[feature_cols].fillna(df[feature_cols].mean())

    if task_type == "classification":
        le = LabelEncoder()
        y = le.fit_transform(df[target_col].astype(str))
        return X, y, feature_cols, le
    else:
        y = pd.to_numeric(df[target_col], errors="coerce").fillna(
            pd.to_numeric(df[target_col], errors="coerce").mean()
        )
        return X, y, feature_cols, None


# ---------------------------------------------------------------------------
# Model definitions
# ---------------------------------------------------------------------------

def _get_models(task_type: str, hp: Dict = None) -> Dict[str, Any]:
    """Return {model_name: sklearn_estimator} for the requested task type."""
    hp = hp or {}
    n_est = int(hp.get("n_estimators", 100))
    max_depth = hp.get("max_depth") or None
    lr = float(hp.get("learning_rate", 0.1))

    if task_type == "classification":
        return {
            "Random Forest": RandomForestClassifier(
                n_estimators=n_est, max_depth=max_depth, random_state=42, n_jobs=-1
            ),
            "Gradient Boosting": GradientBoostingClassifier(
                n_estimators=n_est, learning_rate=lr, random_state=42
            ),
            "SVM": SVC(probability=True, random_state=42),
            "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
            "Neural Network": MLPClassifier(
                hidden_layer_sizes=(64, 32), max_iter=300, random_state=42
            ),
        }
    else:
        return {
            "Random Forest": RandomForestRegressor(
                n_estimators=n_est, max_depth=max_depth, random_state=42, n_jobs=-1
            ),
            "Gradient Boosting": GradientBoostingRegressor(
                n_estimators=n_est, learning_rate=lr, random_state=42
            ),
            "SVR": SVR(),
            "Linear Regression": LinearRegression(),
            "Neural Network": MLPRegressor(
                hidden_layer_sizes=(64, 32), max_iter=300, random_state=42
            ),
        }


# ---------------------------------------------------------------------------
# Metric helpers
# ---------------------------------------------------------------------------

def _compute_metrics(y_test, y_pred, task_type: str) -> Dict[str, float]:
    """Compute accuracy / precision / recall / f1 for both task types."""
    if task_type == "classification":
        acc = round(accuracy_score(y_test, y_pred) * 100, 1)
        prec = round(precision_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 1)
        rec = round(recall_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 1)
        f1 = round(f1_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 1)
    else:
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        std = float(np.std(y_test)) or 1.0
        acc = round(max(0.0, r2) * 100, 1)
        prec = round(max(0.0, 1.0 - mae / std) * 100, 1)
        rec = round(max(0.0, r2 * 0.95) * 100, 1)
        f1 = round(2 * prec * rec / (prec + rec + 1e-8), 1)

    return {"accuracy": acc, "precision": prec, "recall": rec, "f1Score": f1}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_all_models(
    df: pd.DataFrame, target_col: str, task_type: str
) -> List[Dict]:
    """Train and evaluate all supported models; return a list of metric dicts."""
    X, y, feature_cols, _ = prepare_data(df, target_col, task_type)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    results = []
    for name, estimator in _get_models(task_type).items():
        try:
            pipeline = Pipeline([("scaler", StandardScaler()), ("model", estimator)])
            t0 = time.time()
            pipeline.fit(X_train, y_train)
            training_time = round(time.time() - t0, 2)

            y_pred = pipeline.predict(X_test)
            metrics = _compute_metrics(y_test, y_pred, task_type)
            results.append({
                "model": name,
                "trainingTime": training_time,
                **metrics,
            })
        except Exception as exc:
            print(f"[model_service] Skipping {name}: {exc}")

    return results


def train_final_model(
    df: pd.DataFrame,
    target_col: str,
    model_type: str,
    task_type: str,
    hyperparams: Dict = None,
) -> Tuple[Pipeline, Dict[str, float], List[str], Optional[LabelEncoder], Dict[str, Dict]]:
    """
    Train the user-selected model and return everything needed for prediction.

    Returns:
        pipeline        – fitted sklearn Pipeline (scaler + model)
        metrics         – {accuracy, precision, recall, f1Score}
        feature_cols    – list of feature column names used for training
        label_encoder   – fitted LabelEncoder (classification only, else None)
        feature_config  – {col: {min, max, mean, std}} for all feature columns;
                          drives scenario sliders dynamically for any dataset
    """
    X, y, feature_cols, label_encoder = prepare_data(df, target_col, task_type)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Find the requested model (case-insensitive partial match)
    available = _get_models(task_type, hyperparams)
    estimator = None
    norm_requested = _normalize(model_type)
    for name, m in available.items():
        if norm_requested in _normalize(name) or _normalize(name) in norm_requested:
            estimator = m
            break
    if estimator is None:
        estimator = list(available.values())[0]

    pipeline = Pipeline([("scaler", StandardScaler()), ("model", estimator)])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = _compute_metrics(y_test, y_pred, task_type)
    feature_config = get_feature_config(df, feature_cols)

    return pipeline, metrics, feature_cols, label_encoder, feature_config
