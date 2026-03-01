"""
Step 3 – What-If Scenarios router.

Endpoints:
  POST /api/scenarios/run       Run a scenario simulation with the trained model
  POST /api/scenarios/save      Persist a named scenario
  GET  /api/scenarios/          List all saved scenarios
  GET  /api/scenarios/{id}      Get a single saved scenario
  DELETE /api/scenarios/{id}    Delete a saved scenario
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Body, HTTPException

from services.scenario_service import run_scenario
from store import datasets_store, models_store, scenarios_store

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


# ---------------------------------------------------------------------------
# Run simulation
# ---------------------------------------------------------------------------

@router.post("/run")
def run_scenario_endpoint(body: dict = Body(...)):
    """
    Execute a what-if scenario using the stored trained model.

    Body:
    {
      "modelId": "<uuid>",
      "parameters": {
        "studyHours":           20,
        "attendanceRate":       85,
        "tutorialSessions":     3,
        "assignmentCompletion": 90
      }
    }

    Returns:
    {
      "outcome":       82.4,
      "outcomeChange": 8.4,
      "weeklyData": [ { "week": "Week 1", "baseline": 65, "scenario": 66.05 }, ... ]
    }
    """
    model_id = body.get("modelId")
    parameters = body.get("parameters", {})

    model_entry = _get_model_or_404(model_id)
    dataset_id = model_entry["dataset_id"]

    if dataset_id not in datasets_store:
        raise HTTPException(status_code=404, detail="Training dataset no longer available")

    training_df = datasets_store[dataset_id]["df"]

    try:
        result = run_scenario(
            pipeline=model_entry["pipeline"],
            feature_cols=model_entry["feature_cols"],
            param_col_mapping=model_entry["param_col_mapping"],
            training_df=training_df,
            task_type=model_entry["task_type"],
            target_col=model_entry["target_col"],
            parameters=parameters,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scenario simulation failed: {exc}")

    return result


# ---------------------------------------------------------------------------
# Save scenario
# ---------------------------------------------------------------------------

@router.post("/save")
def save_scenario(body: dict = Body(...)):
    """
    Persist a scenario result so it can be referenced in reports.

    The body should include the full scenario object as built by the frontend
    (name, date, datasetName, modelUsed, parameters, outcome, outcomeChange).
    """
    scenario_id = str(uuid.uuid4())
    scenario = {
        "id": scenario_id,
        **body,
        "savedAt": datetime.now().isoformat(),
    }
    scenarios_store[scenario_id] = scenario
    return {"scenarioId": scenario_id, **scenario}


# ---------------------------------------------------------------------------
# List / get / delete
# ---------------------------------------------------------------------------

@router.get("/")
def list_scenarios():
    """Return all saved scenarios."""
    return {"scenarios": list(scenarios_store.values())}


@router.get("/{scenario_id}")
def get_scenario(scenario_id: str):
    """Return a single saved scenario by ID."""
    if scenario_id not in scenarios_store:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenarios_store[scenario_id]


@router.delete("/{scenario_id}")
def delete_scenario(scenario_id: str):
    """Delete a saved scenario."""
    if scenario_id not in scenarios_store:
        raise HTTPException(status_code=404, detail="Scenario not found")
    del scenarios_store[scenario_id]
    return {"deleted": scenario_id}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_model_or_404(model_id: str) -> dict:
    if not model_id or model_id not in models_store:
        raise HTTPException(status_code=404, detail="Model not found – train a model first")
    return models_store[model_id]
