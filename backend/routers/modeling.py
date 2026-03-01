"""
Step 2 – Predictive Modeling router.

Endpoints:
  GET  /api/modeling/columns/{dataset_id}   List columns for target selection
  POST /api/modeling/evaluate               Evaluate all models and compare
  POST /api/modeling/train                  Train the final selected model
"""

import uuid
from datetime import datetime

import numpy as np
from fastapi import APIRouter, Body, HTTPException

from services.model_service import (
    evaluate_all_models,
    find_target_column,
    train_final_model,
)
from store import datasets_store, models_store

router = APIRouter(prefix="/api/modeling", tags=["modeling"])


# ---------------------------------------------------------------------------
# List columns
# ---------------------------------------------------------------------------

@router.get("/columns/{dataset_id}")
def get_columns(dataset_id: str):
    """
    Return column names and types from a stored dataset.
    Used by the frontend to let the user pick the target variable.
    """
    entry = _get_dataset_or_404(dataset_id)
    df = entry["df"]

    columns = []
    for col in df.columns:
        if np.issubdtype(df[col].dtype, np.number):
            col_type = "Numeric"
        elif df[col].nunique() <= 10:
            col_type = "Categorical"
        else:
            col_type = "Text"
        columns.append({
            "name": col,
            "type": col_type,
            "uniqueValues": int(df[col].nunique()),
        })

    return {"datasetId": dataset_id, "columns": columns}


# ---------------------------------------------------------------------------
# Evaluate all models
# ---------------------------------------------------------------------------

@router.post("/evaluate")
def evaluate_models(body: dict = Body(...)):
    """
    Auto-train and evaluate all supported models for a given dataset/target.

    Body:
    {
      "datasetId":   "<uuid>",
      "targetLabel": "Performance Score",   // display label from the UI
      "taskType":    "regression"            // or "classification"
    }

    Returns a list of model metrics plus the recommended model name.
    """
    dataset_id = body.get("datasetId")
    target_label = body.get("targetLabel", "")
    task_type = body.get("taskType", "regression")

    entry = _get_dataset_or_404(dataset_id)
    df = entry["df"]

    target_col = find_target_column(df, target_label)

    try:
        results = evaluate_all_models(df, target_col, task_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model evaluation failed: {exc}")

    recommended = max(results, key=lambda r: r["accuracy"])["model"] if results else None

    return {
        "targetColumn": target_col,
        "models": results,
        "recommendedModel": recommended,
    }


# ---------------------------------------------------------------------------
# Train final model
# ---------------------------------------------------------------------------

@router.post("/train")
def train_model(body: dict = Body(...)):
    """
    Train the user-selected model and store it for scenario simulation.

    Body:
    {
      "datasetId":   "<uuid>",
      "targetLabel": "Performance Score",
      "taskType":    "regression",
      "modelType":   "Random Forest",
      "hyperparams": { "n_estimators": 100, "max_depth": null, "learning_rate": 0.1 }
    }

    Returns the model ID and final training metrics.
    """
    dataset_id = body.get("datasetId")
    target_label = body.get("targetLabel", "")
    task_type = body.get("taskType", "regression")
    model_type = body.get("modelType", "Random Forest")
    hyperparams = body.get("hyperparams", {})

    entry = _get_dataset_or_404(dataset_id)
    df = entry["df"]

    target_col = find_target_column(df, target_label)

    try:
        pipeline, metrics, feature_cols, label_encoder, param_col_mapping = train_final_model(
            df, target_col, model_type, task_type, hyperparams
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}")

    model_id = str(uuid.uuid4())
    models_store[model_id] = {
        "pipeline": pipeline,
        "feature_cols": feature_cols,
        "target_col": target_col,
        "task_type": task_type,
        "model_type": model_type,
        "param_col_mapping": param_col_mapping,
        "dataset_id": dataset_id,
        "label_encoder": label_encoder,
        "metrics": metrics,
        "created_at": datetime.now().isoformat(),
    }

    return {
        "modelId": model_id,
        "modelType": model_type,
        "targetColumn": target_col,
        **metrics,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_dataset_or_404(dataset_id: str) -> dict:
    if not dataset_id or dataset_id not in datasets_store:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return datasets_store[dataset_id]
