"""
Step 1 – Dataset router.

Endpoints:
  POST /api/datasets/upload              Upload a CSV/XLSX file
  GET  /api/datasets/{id}/preview        First-5-rows preview + column types
  POST /api/datasets/{id}/clean          Apply cleaning options
  POST /api/datasets/{id}/generate-synthetic  Generate synthetic expansion
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Body, File, Form, HTTPException, UploadFile

from services.data_service import (
    clean_data,
    compute_quality,
    generate_synthetic,
    get_preview,
    parse_file,
)
from store import datasets_store

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    generate_synthetic_data: bool = Form(False),
    synthetic_records: int = Form(500),
):
    """
    Upload a CSV or XLSX file.

    Returns DatasetInfo for the real dataset and, if requested,
    a DatasetInfo for the auto-generated synthetic expansion.
    """
    try:
        file_bytes = await file.read()
        df = parse_file(file_bytes, file.filename or "upload.csv")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {exc}")

    quality = compute_quality(df)
    dataset_id = str(uuid.uuid4())

    datasets_store[dataset_id] = {
        "df": df,
        "name": name,
        "type": "Real",
        "quality": quality,
        "created_at": datetime.now().isoformat(),
    }

    response: dict = {
        "datasetId": dataset_id,
        "name": name,
        "records": len(df),
        "columns": len(df.columns),
        "quality": quality["overall_quality"],
        "type": "Real",
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "qualityReport": quality,
    }

    if generate_synthetic_data and synthetic_records > 0:
        try:
            synth_df = generate_synthetic(df, synthetic_records)
            synth_quality = compute_quality(synth_df)
            synth_id = str(uuid.uuid4())
            synth_name = f"Synthetic Expansion – {name}"

            datasets_store[synth_id] = {
                "df": synth_df,
                "name": synth_name,
                "type": "Synthetic",
                "quality": synth_quality,
                "created_at": datetime.now().isoformat(),
            }

            response["synthetic"] = {
                "datasetId": synth_id,
                "name": synth_name,
                "records": synthetic_records,
                "columns": len(synth_df.columns),
                "quality": synth_quality["overall_quality"],
                "type": "Synthetic",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            }
        except Exception as exc:
            # Synthetic generation failure is non-fatal
            response["syntheticError"] = str(exc)

    return response


# ---------------------------------------------------------------------------
# Preview
# ---------------------------------------------------------------------------

@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: str):
    """Return first-5 rows and detected column types for a stored dataset."""
    entry = _get_or_404(dataset_id)
    return get_preview(entry["df"])


# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------

@router.post("/{dataset_id}/clean")
def clean_dataset(dataset_id: str, options: dict = Body(...)):
    """
    Apply data-cleaning operations to a stored dataset (in-place update).

    Body example:
    {
      "fix_missing": true,
      "missing_method": "mean",
      "fix_outliers": true,
      "outlier_method": "cap",
      "fix_duplicates": true,
      "fix_text": false
    }
    """
    entry = _get_or_404(dataset_id)
    df = entry["df"]

    try:
        cleaned_df, stats = clean_data(df, options)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cleaning failed: {exc}")

    new_quality = compute_quality(cleaned_df)

    # Persist the cleaned DataFrame
    datasets_store[dataset_id]["df"] = cleaned_df
    datasets_store[dataset_id]["quality"] = new_quality

    return {
        "datasetId": dataset_id,
        "newQuality": new_quality["overall_quality"],
        "qualityReport": new_quality,
        "rowsRemoved": stats["rows_removed"],
        "cellsFixed": stats["cells_fixed"],
        "remainingRecords": len(cleaned_df),
    }


# ---------------------------------------------------------------------------
# Generate synthetic
# ---------------------------------------------------------------------------

@router.post("/{dataset_id}/generate-synthetic")
def generate_synthetic_dataset(dataset_id: str, body: dict = Body(...)):
    """
    Generate a new synthetic dataset based on a stored real dataset.

    Body: { "numRecords": 500 }
    """
    entry = _get_or_404(dataset_id)
    n_records = int(body.get("numRecords", 500))
    original_name = entry["name"]

    try:
        synth_df = generate_synthetic(entry["df"], n_records)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Synthetic generation failed: {exc}")

    synth_quality = compute_quality(synth_df)
    synth_id = str(uuid.uuid4())
    synth_name = f"Synthetic Expansion – {original_name}"

    datasets_store[synth_id] = {
        "df": synth_df,
        "name": synth_name,
        "type": "Synthetic",
        "quality": synth_quality,
        "created_at": datetime.now().isoformat(),
    }

    return {
        "datasetId": synth_id,
        "name": synth_name,
        "records": n_records,
        "columns": len(synth_df.columns),
        "quality": synth_quality["overall_quality"],
        "type": "Synthetic",
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_or_404(dataset_id: str) -> dict:
    if dataset_id not in datasets_store:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return datasets_store[dataset_id]
