"""
Step 4 – Insights & Reports router.

Endpoints:
  POST /api/reports/insights    Generate key insight + recommended action for a scenario
  POST /api/reports/generate    Generate and download a full HTML report
"""

from datetime import datetime

from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import HTMLResponse

from services.report_service import generate_insights, generate_report_html

router = APIRouter(prefix="/api/reports", tags=["reports"])


# ---------------------------------------------------------------------------
# Insights
# ---------------------------------------------------------------------------

@router.post("/insights")
def get_insights(body: dict = Body(...)):
    """
    Generate key insight and recommended action for a scenario.

    Body:
    {
      "scenario":    { ... scenario object ... },
      "targetLabel": "Performance Score"
    }

    Returns:
    {
      "keyInsight":        { "title": ..., "description": ..., "detailedAnalysis": ... },
      "recommendedAction": { "title": ..., "description": ... }
    }
    """
    scenario = body.get("scenario")
    target_label = body.get("targetLabel", "Performance Score")

    if not scenario:
        raise HTTPException(status_code=400, detail="'scenario' field is required")

    return generate_insights(scenario, target_label)


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

@router.post("/generate")
def generate_report(body: dict = Body(...)):
    """
    Generate a formatted HTML analysis report and return it as a file download.

    Body:
    {
      "scenario":        { ... scenario object ... },
      "targetLabel":     "Performance Score",
      "modelType":       "Random Forest",
      "datasetName":     "Fall 2024 Student Performance",
      "includeInsights": true,
      "includeActions":  true
    }
    """
    scenario = body.get("scenario")
    target_label = body.get("targetLabel", "Performance Score")
    model_type = body.get("modelType", "Unknown Model")
    dataset_name = body.get("datasetName", "Unknown Dataset")
    include_insights = bool(body.get("includeInsights", True))
    include_actions = bool(body.get("includeActions", True))

    if not scenario:
        raise HTTPException(status_code=400, detail="'scenario' field is required")

    try:
        html_content = generate_report_html(
            scenario=scenario,
            target_label=target_label,
            model_type=model_type,
            dataset_name=dataset_name,
            include_insights=include_insights,
            include_actions=include_actions,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}")

    filename = f"SimuCast_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"

    return HTMLResponse(
        content=html_content,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
