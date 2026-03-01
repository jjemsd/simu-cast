"""
Step 3 – What-If Scenario service.

Uses the trained model (from model_service) to predict the outcome for a
set of scenario parameters and generates an 8-week trajectory.
"""

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

# Baseline trajectory matching the frontend hard-coded values
_BASELINE_WEEKLY = [65.0, 67.0, 68.0, 70.0, 71.0, 72.0, 73.0, 74.0]
_BASELINE_FINAL = _BASELINE_WEEKLY[-1]  # 74.0


def _normalize_outcome(raw: float, training_df: pd.DataFrame, target_col: str) -> float:
    """
    Scale the raw model prediction into the 0–100 range used by the UI.
    If the target is already in [0, 100] we leave it as-is.
    """
    if 0.0 <= raw <= 100.0:
        return raw

    col_min = float(training_df[target_col].min())
    col_max = float(training_df[target_col].max())
    span = col_max - col_min or 1.0
    return max(0.0, min(100.0, (raw - col_min) / span * 100.0))


def run_scenario(
    pipeline,
    feature_cols: List[str],
    param_col_mapping: Dict[str, Optional[str]],
    training_df: pd.DataFrame,
    task_type: str,
    target_col: str,
    parameters: Dict[str, float],
) -> Dict[str, Any]:
    """
    Run a what-if scenario simulation.

    Strategy:
    1. Start with training-data column means as the default feature row.
    2. Override the columns that correspond to the 4 slider parameters.
    3. Feed the row into the trained model to get a predicted outcome.
    4. Build an 8-week trajectory interpolating from the baseline start
       to the predicted outcome.

    Returns a dict with 'outcome', 'outcomeChange', and 'weeklyData'.
    """
    # Build feature row from training means
    feature_means = training_df[feature_cols].mean().to_dict()
    row = dict(feature_means)

    # Slider parameter → value mapping (frontend camelCase → snake_case)
    slider_values: Dict[str, float] = {
        "study_hours": float(parameters.get("studyHours", 15)),
        "attendance_rate": float(parameters.get("attendanceRate", 75)),
        "tutorial_sessions": float(parameters.get("tutorialSessions", 2)),
        "assignment_completion": float(parameters.get("assignmentCompletion", 80)),
    }

    for param, col in param_col_mapping.items():
        if col and col in row:
            row[col] = slider_values[param]

    X_pred = pd.DataFrame([row])[feature_cols]

    # Predict
    if task_type == "classification":
        try:
            proba = pipeline.predict_proba(X_pred)
            # Use probability of the positive / last class as the outcome
            raw_outcome = float(proba[0][-1]) * 100.0
        except Exception:
            pred = pipeline.predict(X_pred)
            raw_outcome = float(pred[0]) * 100.0 if float(pred[0]) <= 1.0 else float(pred[0])
    else:
        raw_outcome = float(pipeline.predict(X_pred)[0])
        raw_outcome = _normalize_outcome(raw_outcome, training_df, target_col)

    outcome = round(max(0.0, min(100.0, raw_outcome)), 1)
    outcome_change = round(outcome - _BASELINE_FINAL, 1)

    # Build 8-week trajectory: linear interpolation from Week-1 baseline to outcome
    start = _BASELINE_WEEKLY[0]
    weekly_data: List[Dict[str, Any]] = []
    for i, baseline_val in enumerate(_BASELINE_WEEKLY):
        progress = (i + 1) / len(_BASELINE_WEEKLY)
        week_scenario = round(start + (outcome - start) * progress, 1)
        week_scenario = max(0.0, min(100.0, week_scenario))
        weekly_data.append({
            "week": f"Week {i + 1}",
            "baseline": baseline_val,
            "scenario": week_scenario,
        })

    return {
        "outcome": outcome,
        "outcomeChange": outcome_change,
        "weeklyData": weekly_data,
    }
