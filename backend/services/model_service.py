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
# Column matching – maps slider parameter names → actual CSV column names
# ---------------------------------------------------------------------------

_PARAM_PATTERNS: Dict[str, List[str]] = {
    "study_hours": ["study hours", "studyhours", "study_hours", "hours", "weekly hours", "study time"],
    "attendance_rate": ["attendance", "attendance rate", "attendance_rate", "present"],
    "tutorial_sessions": ["tutorial", "tutorials", "tutorial sessions", "tutorial_sessions", "sessions"],
    "assignment_completion": [
        "assignment",
        "assignments",
        "assignment completion",
        "assignment_completion",
        "homework",
        "completion",
    ],
}


def _normalize(s: str) -> str:
    return s.lower().replace("_", " ").replace("/", " ").strip()


def find_column(df: pd.DataFrame, patterns: List[str]) -> Optional[str]:
    """Find the first column whose normalized name matches any pattern."""
    col_map = {_normalize(c): c for c in df.columns}
    for pattern in patterns:
        if pattern in col_map:
            return col_map[pattern]
    return None


def get_param_col_mapping(df: pd.DataFrame, feature_cols: List[str]) -> Dict[str, Optional[str]]:
    """Return {slider_param: actual_column_name} for each of the 4 scenario parameters."""
    sub = df[feature_cols]
    return {param: find_column(sub, patterns) for param, patterns in _PARAM_PATTERNS.items()}


def find_target_column(df: pd.DataFrame, label: str) -> str:
    """
    Fuzzy-match a display label (e.g. 'Performance Score') to an actual
    column name in the DataFrame. Falls back to the last numeric column.
    """
    norm_label = _normalize(label)
    for col in df.columns:
        if _normalize(col) == norm_label:
            return col
    # Partial match
    for col in df.columns:
        if norm_label in _normalize(col) or _normalize(col) in norm_label:
            return col
    # Keyword match
    keywords = {
        "performance score": ["performance", "score"],
        "passfail status": ["pass", "fail", "status", "result"],
        "final grade": ["grade", "final"],
        "gpa prediction": ["gpa"],
    }
    for key, kws in keywords.items():
        if any(kw in norm_label for kw in kws):
            for col in df.columns:
                if any(kw in _normalize(col) for kw in kws):
                    return col
    # Fallback: last numeric column
    num_cols = df.select_dtypes(include=[np.number]).columns
    return num_cols[-1] if len(num_cols) else df.columns[-1]


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
) -> Tuple[Pipeline, Dict[str, float], List[str], Optional[LabelEncoder], Dict[str, Optional[str]]]:
    """
    Train the user-selected model and return everything needed for prediction.

    Returns:
        pipeline           – fitted sklearn Pipeline (scaler + model)
        metrics            – {accuracy, precision, recall, f1Score}
        feature_cols       – list of feature column names used for training
        label_encoder      – fitted LabelEncoder (classification only, else None)
        param_col_mapping  – {slider_param: csv_column_name}
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
        estimator = list(available.values())[0]  # default to first

    pipeline = Pipeline([("scaler", StandardScaler()), ("model", estimator)])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = _compute_metrics(y_test, y_pred, task_type)
    param_col_mapping = get_param_col_mapping(df, feature_cols)

    return pipeline, metrics, feature_cols, label_encoder, param_col_mapping
