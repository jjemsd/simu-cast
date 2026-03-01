"""
Step 3 – What-If Scenario service.

Uses the trained model (from model_service) to predict the outcome for a
set of scenario parameters and generates an 8-week trajectory.

All baseline values are derived from the actual uploaded dataset rather
than any hardcoded constants, so the service works with any dataset.
"""

from typing import Any, Dict, List

import numpy as np
import pandas as pd


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


def _predict_outcome(
    pipeline,
    feature_cols: List[str],
    row: Dict[str, float],
    task_type: str,
    training_df: pd.DataFrame,
    target_col: str,
) -> float:
    """Run the pipeline on a single feature row and return a 0–100 score."""
    X_pred = pd.DataFrame([row])[feature_cols]

    if task_type == "classification":
        try:
            proba = pipeline.predict_proba(X_pred)
            # Probability of the positive / last class
            return float(proba[0][-1]) * 100.0
        except Exception:
            pred = pipeline.predict(X_pred)
            val = float(pred[0])
            return val * 100.0 if val <= 1.0 else val
    else:
        raw = float(pipeline.predict(X_pred)[0])
        return _normalize_outcome(raw, training_df, target_col)


def run_scenario(
    pipeline,
    feature_cols: List[str],
    feature_config: Dict[str, Dict],
    training_df: pd.DataFrame,
    task_type: str,
    target_col: str,
    parameters: Dict[str, float],
) -> Dict[str, Any]:
    """
    Run a what-if scenario simulation.

    Strategy:
    1. Build a baseline feature row from each column's training mean.
    2. Predict the baseline outcome (what the model expects at average values).
    3. Override the baseline row with the user-supplied parameter values.
    4. Predict the scenario outcome.
    5. Build an 8-week trajectory where both lines start at the same initial
       point (88 % of baseline) and converge to their respective endpoints,
       letting the chart show divergence driven by the real data.

    Args:
        pipeline        – fitted sklearn Pipeline
        feature_cols    – ordered list of feature column names
        feature_config  – {col: {min, max, mean, std}} for all feature cols;
                          computed from the actual uploaded dataset
        training_df     – original training DataFrame (for normalisation)
        task_type       – 'classification' | 'regression'
        target_col      – name of the target column
        parameters      – {column_name: value} for any feature columns the
                          user wants to override from their baseline means

    Returns:
        {
            "outcome":         <scenario score 0-100>,
            "baselineOutcome": <baseline score 0-100>,
            "outcomeChange":   <scenario - baseline>,
            "weeklyData":      [ {"week": "Week N", "baseline": …, "scenario": …} ]
        }
    """
    # --- Baseline row: every feature at its training mean ---
    baseline_row = {col: feature_config[col]["mean"] for col in feature_cols}

    baseline_raw = _predict_outcome(
        pipeline, feature_cols, baseline_row, task_type, training_df, target_col
    )
    baseline_outcome = round(max(0.0, min(100.0, baseline_raw)), 1)

    # --- Scenario row: baseline overridden with user values ---
    scenario_row = dict(baseline_row)
    for col, value in parameters.items():
        if col in scenario_row:
            scenario_row[col] = float(value)

    scenario_raw = _predict_outcome(
        pipeline, feature_cols, scenario_row, task_type, training_df, target_col
    )
    scenario_outcome = round(max(0.0, min(100.0, scenario_raw)), 1)

    outcome_change = round(scenario_outcome - baseline_outcome, 1)

    # --- 8-week trajectory ---
    # Both lines originate from the same starting point (88 % of baseline)
    # and converge to their respective endpoints by Week 8.
    n_weeks = 8
    start = round(baseline_outcome * 0.88, 1)

    weekly_data: List[Dict[str, Any]] = []
    for i in range(n_weeks):
        progress = (i + 1) / n_weeks
        week_baseline = round(start + (baseline_outcome - start) * progress, 1)
        week_scenario = round(start + (scenario_outcome - start) * progress, 1)
        weekly_data.append({
            "week": f"Week {i + 1}",
            "baseline": max(0.0, min(100.0, week_baseline)),
            "scenario": max(0.0, min(100.0, week_scenario)),
        })

    return {
        "outcome": scenario_outcome,
        "baselineOutcome": baseline_outcome,
        "outcomeChange": outcome_change,
        "weeklyData": weekly_data,
    }
