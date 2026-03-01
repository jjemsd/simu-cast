"""
Step 1 – Data Preparation service.

Handles file parsing, quality assessment, data cleaning, synthetic data
generation, and data preview for the Overview page.
"""

import math
import numpy as np
import pandas as pd
from io import BytesIO
from typing import Tuple, Dict, Any


def _to_python(val: object) -> object:
    """Convert a value to a JSON-safe Python native type."""
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    if isinstance(val, np.integer):
        return int(val)
    if isinstance(val, np.floating):
        return None if np.isnan(val) else float(val)
    if isinstance(val, np.bool_):
        return bool(val)
    return val


# ---------------------------------------------------------------------------
# File parsing
# ---------------------------------------------------------------------------

def parse_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse an uploaded CSV or XLSX file and return a DataFrame."""
    ext = filename.lower().rsplit(".", 1)[-1]
    buf = BytesIO(file_bytes)
    if ext == "csv":
        return pd.read_csv(buf)
    elif ext in ("xlsx", "xls"):
        return pd.read_excel(buf)
    raise ValueError(f"Unsupported file type: .{ext}. Please upload a CSV or XLSX file.")


# ---------------------------------------------------------------------------
# Quality assessment
# ---------------------------------------------------------------------------

def compute_quality(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Compute data quality metrics.
    Returns a dict with an overall_quality score (0–100) and per-issue details.
    """
    n_rows, n_cols = df.shape
    total_cells = n_rows * n_cols or 1

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    text_cols = df.select_dtypes(include=["object"]).columns.tolist()

    # --- Missing values ---
    missing_per_col = df.isnull().sum()
    missing_total = int(missing_per_col.sum())
    missing_pct = round(missing_total / total_cells * 100, 1)
    missing_cols = [c for c in df.columns if missing_per_col[c] > 0]

    # --- Outliers (IQR method on numeric columns) ---
    outlier_count = 0
    outlier_cols = []
    for col in numeric_cols:
        q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        iqr = q3 - q1
        n_out = int(((df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)).sum())
        if n_out:
            outlier_count += n_out
            outlier_cols.append(col)
    denom_outlier = (n_rows * len(numeric_cols)) or 1
    outlier_pct = round(outlier_count / denom_outlier * 100, 1)

    # --- Duplicates ---
    dup_count = int(df.duplicated().sum())
    dup_pct = round(dup_count / n_rows * 100, 1) if n_rows else 0

    # --- Text issues (leading/trailing spaces, inconsistent casing) ---
    text_issue_count = 0
    text_issue_cols = []
    for col in text_cols:
        issues = df[col].dropna().apply(lambda x: str(x) != str(x).strip()).sum()
        if issues:
            text_issue_count += int(issues)
            text_issue_cols.append(col)
    denom_text = (n_rows * len(text_cols)) or 1
    text_pct = round(text_issue_count / denom_text * 100, 1)

    # --- Overall quality score ---
    deductions = min(80, missing_pct * 2 + outlier_pct * 1.5 + dup_pct * 2 + text_pct * 0.5)
    overall_quality = round(max(20, 100 - deductions), 1)

    return {
        "overall_quality": overall_quality,
        "missing_values": {
            "count": missing_total,
            "percentage": missing_pct,
            "columns": missing_cols,
        },
        "outliers": {
            "count": outlier_count,
            "percentage": outlier_pct,
            "columns": outlier_cols,
        },
        "duplicates": {
            "count": dup_count,
            "percentage": dup_pct,
            "columns": ["all columns"] if dup_count else [],
        },
        "text_issues": {
            "count": text_issue_count,
            "percentage": text_pct,
            "columns": text_issue_cols,
        },
        "invalid": {
            "count": 0,
            "percentage": 0.0,
            "columns": [],
        },
    }


# ---------------------------------------------------------------------------
# Data cleaning
# ---------------------------------------------------------------------------

def clean_data(
    df: pd.DataFrame, options: Dict[str, Any]
) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """
    Apply cleaning operations selected by the user.

    options keys:
        fix_missing     bool
        missing_method  'mean' | 'median' | 'mode' | 'remove'
        fix_outliers    bool
        outlier_method  'cap' | 'remove'
        fix_duplicates  bool
        fix_text        bool

    Returns (cleaned_df, stats) where stats = {rows_removed, cells_fixed}.
    """
    df = df.copy()
    stats = {"rows_removed": 0, "cells_fixed": 0}
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    text_cols = df.select_dtypes(include=["object"]).columns.tolist()

    # --- Fix missing values ---
    if options.get("fix_missing"):
        method = options.get("missing_method", "mean")
        cells_before = int(df.isnull().sum().sum())

        if method == "remove":
            before = len(df)
            df = df.dropna()
            stats["rows_removed"] += before - len(df)
        else:
            for col in numeric_cols:
                if method == "mean":
                    df[col] = df[col].fillna(df[col].mean())
                elif method == "median":
                    df[col] = df[col].fillna(df[col].median())
                elif method == "mode":
                    mode = df[col].mode()
                    df[col] = df[col].fillna(mode[0] if not mode.empty else 0)
            for col in text_cols:
                mode = df[col].mode()
                df[col] = df[col].fillna(mode[0] if not mode.empty else "Unknown")

        cells_after = int(df.isnull().sum().sum())
        stats["cells_fixed"] += max(0, cells_before - cells_after)

    # --- Fix outliers ---
    if options.get("fix_outliers"):
        method = options.get("outlier_method", "cap")
        for col in numeric_cols:
            q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
            iqr = q3 - q1
            lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            if method == "cap":
                df[col] = df[col].clip(lower=lower, upper=upper)
            elif method == "remove":
                before = len(df)
                df = df[(df[col] >= lower) & (df[col] <= upper)]
                stats["rows_removed"] += before - len(df)

    # --- Fix duplicates ---
    if options.get("fix_duplicates"):
        before = len(df)
        df = df.drop_duplicates()
        stats["rows_removed"] += before - len(df)

    # --- Fix text issues ---
    if options.get("fix_text"):
        for col in text_cols:
            df[col] = df[col].str.strip().str.lower()

    return df, stats


# ---------------------------------------------------------------------------
# Synthetic data generation
# ---------------------------------------------------------------------------

def generate_synthetic(df: pd.DataFrame, n_records: int) -> pd.DataFrame:
    """
    Generate synthetic records that mirror the statistical properties
    (mean, std, min, max, value distribution) of the original DataFrame.
    """
    synthetic: Dict[str, Any] = {}

    for col in df.columns:
        series = df[col].dropna()
        if series.empty:
            synthetic[col] = [None] * n_records
            continue

        if pd.api.types.is_numeric_dtype(series):
            mean, std = float(series.mean()), float(series.std())
            col_min, col_max = float(series.min()), float(series.max())
            generated = np.clip(np.random.normal(mean, std or 1, n_records), col_min, col_max)
            if pd.api.types.is_integer_dtype(series):
                generated = generated.round().astype(int)
            synthetic[col] = generated
        else:
            counts = series.value_counts(normalize=True)
            synthetic[col] = np.random.choice(counts.index, size=n_records, p=counts.values)

    return pd.DataFrame(synthetic)


# ---------------------------------------------------------------------------
# Data preview
# ---------------------------------------------------------------------------

def get_preview(df: pd.DataFrame) -> Dict[str, Any]:
    """Return the first 5 rows and detected column types."""
    raw_rows = df.head(5).to_dict(orient="records")
    preview_rows = [
        {col: _to_python(val) for col, val in row.items()}
        for row in raw_rows
    ]

    column_types = []
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            col_type = "Numeric"
        elif "datetime" in str(df[col].dtype):
            col_type = "Date"
        else:
            unique_ratio = df[col].nunique() / max(len(df), 1)
            col_type = "Text" if unique_ratio > 0.5 else "Categorical"

        column_types.append({
            "column": col,
            "type": col_type,
            "missingCount": int(df[col].isnull().sum()),
        })

    return {
        "columns": list(df.columns),
        "previewRows": preview_rows,
        "columnTypes": column_types,
        "totalRecords": len(df),
    }
