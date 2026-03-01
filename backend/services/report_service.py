"""
Step 4 – Insights & Report service.

Generates AI-style textual insights from a scenario result and produces
a downloadable HTML report.

All parameter labels, baselines, and units are derived from the scenario's
featureConfig (populated from the actual uploaded dataset), not hardcoded.
"""

from datetime import datetime
from typing import Any, Dict


# ---------------------------------------------------------------------------
# Insight generation
# ---------------------------------------------------------------------------

def _param_impact(col: str, params: Dict, feature_config: Dict) -> float:
    """
    Compute the normalised impact of a single parameter change.
    Uses z-score distance from the column's training mean.
    """
    val = params.get(col)
    if val is None or col not in feature_config:
        return 0.0
    fc = feature_config[col]
    mean = fc.get("mean", float(val))
    std = fc.get("std", 1.0) or 1.0
    return abs((float(val) - mean) / std)


def generate_insights(scenario: Dict[str, Any], target_label: str) -> Dict[str, Any]:
    """
    Derive key insight and recommended action from a saved scenario.

    The scenario dict must include:
        parameters    – {column_name: value}  (actual CSV column names)
        featureConfig – {column_name: {min, max, mean, std}}
        outcomeChange – float

    Returns a dict with 'keyInsight' and 'recommendedAction'.
    """
    params: Dict = scenario.get("parameters", {})
    feature_config: Dict = scenario.get("featureConfig", {})
    outcome_change: float = float(scenario.get("outcomeChange", 0.0))
    is_positive = outcome_change >= 0

    # Find the parameter with the greatest normalised deviation from its mean
    ranked = sorted(
        params.keys(),
        key=lambda col: _param_impact(col, params, feature_config),
        reverse=True,
    )
    top_param = ranked[0] if ranked else None

    if top_param:
        top_val = float(params[top_param])
        top_mean = feature_config.get(top_param, {}).get("mean", top_val)
        top_label = top_param.replace("_", " ").title()
    else:
        top_val = top_mean = 0.0
        top_label = "parameter"

    # ---- Key insight ----
    if abs(outcome_change) < 1:
        key_insight = {
            "title": "Minimal Impact Observed",
            "description": (
                "The current scenario parameters show minimal deviation from baseline predictions. "
                "Consider testing more substantial interventions to observe meaningful changes."
            ),
            "detailedAnalysis": (
                "Statistical analysis indicates the parameter adjustments fall within the margin of "
                "error for predictive accuracy. Try adjusting at least one variable by 25% or more, "
                "or combine multiple interventions."
            ),
        }
    elif is_positive:
        key_insight = {
            "title": f"{top_label} Improvement Shows Promise",
            "description": (
                f"Adjusting {top_label} to {top_val:.3g} correlates with improved "
                f"{target_label} by {abs(outcome_change):.1f}%. "
                f"This is the primary driver of the predicted gain."
            ),
            "detailedAnalysis": (
                f"Model analysis reveals that {top_label} has strong predictive power in the "
                f"current dataset. The value was changed from a baseline of {top_mean:.3g} "
                f"to {top_val:.3g}, representing the largest normalised deviation among all "
                f"adjusted parameters. The relationship suggests room for further optimisation."
            ),
        }
    else:
        key_insight = {
            "title": f"{top_label} Change May Hinder Outcomes",
            "description": (
                f"Adjusting {top_label} to {top_val:.3g} shows negative correlation with "
                f"{target_label} ({abs(outcome_change):.1f}% decline). "
                f"This configuration may not align with optimal intervention strategies."
            ),
            "detailedAnalysis": (
                f"The predictive model indicates that adjusting {top_label} away from its "
                f"baseline value of {top_mean:.3g} introduces risk. "
                f"This parameter requires careful monitoring."
            ),
        }

    # ---- Recommended action ----
    if abs(outcome_change) < 1:
        recommended_action = {
            "title": "Test More Substantial Interventions",
            "description": (
                "Current parameters are too close to baseline to generate meaningful predictions. "
                "Adjust at least one variable by 25% or more to derive actionable insights."
            ),
        }
    elif is_positive:
        # "High impact" if any parameter deviated by more than 1 std from its mean
        high_impact = any(_param_impact(col, params, feature_config) > 1.0 for col in params)
        if high_impact:
            recommended_action = {
                "title": "Implement High-Impact Intervention Program",
                "description": (
                    "Positive scenario outcomes suggest developing a structured program targeting "
                    "the adjusted parameters. Monitor implementation closely and track actual "
                    "outcomes against predictions to validate model accuracy."
                ),
            }
        else:
            recommended_action = {
                "title": "Scale Current Intervention Strategy",
                "description": (
                    "Scenario predictions indicate favourable outcomes. Begin a pilot with a small "
                    "cohort, establish measurement protocols, and prepare for broader rollout based "
                    "on observed results."
                ),
            }
    else:
        recommended_action = {
            "title": "Avoid This Configuration in Practice",
            "description": (
                "Model predictions suggest this scenario may lead to sub-optimal outcomes. "
                "Maintain parameters at or above baseline levels and consider alternative "
                "intervention strategies that show positive predicted impact."
            ),
        }

    return {"keyInsight": key_insight, "recommendedAction": recommended_action}


# ---------------------------------------------------------------------------
# HTML report generation
# ---------------------------------------------------------------------------

def generate_report_html(
    scenario: Dict[str, Any],
    target_label: str,
    model_type: str,
    dataset_name: str,
    include_insights: bool,
    include_actions: bool,
) -> str:
    """Generate a formatted HTML analysis report and return it as a string."""
    insights = generate_insights(scenario, target_label)
    key_insight = insights["keyInsight"]
    recommended_action = insights["recommendedAction"]

    params: Dict = scenario.get("parameters", {})
    feature_config: Dict = scenario.get("featureConfig", {})
    outcome: float = float(scenario.get("outcome", 0.0))
    baseline_outcome: float = float(scenario.get("baselineOutcome", outcome))
    outcome_change: float = float(scenario.get("outcomeChange", 0.0))
    is_positive = outcome_change >= 0

    now = datetime.now().strftime("%B %d, %Y – %I:%M %p")
    change_sign = "+" if outcome_change >= 0 else ""

    def _param_row(col_name: str, value: float) -> str:
        fc = feature_config.get(col_name, {})
        baseline = fc.get("mean", value)
        diff = value - baseline
        label = col_name.replace("_", " ").title()
        diff_str = f"{'+' if diff >= 0 else ''}{diff:.3g}"
        return (
            f"<tr><td>{label}</td>"
            f"<td>{value:.3g}</td>"
            f"<td>{baseline:.3g}</td>"
            f"<td>{diff_str}</td></tr>"
        )

    param_rows_html = "\n".join(
        _param_row(col, float(val)) for col, val in params.items()
    ) if params else "<tr><td colspan='4'>No parameters recorded</td></tr>"

    insight_block = ""
    if include_insights:
        insight_block = f"""
  <div class="section">
    <h2 class="section-title">Analysis and Insights</h2>
    <div class="content-block">
      <h3>{key_insight['title']}</h3>
      <p>{key_insight['description']}</p>
      <p><strong>Detailed Analysis:</strong> {key_insight['detailedAnalysis']}</p>
    </div>
  </div>"""

    action_block = ""
    if include_actions:
        action_block = f"""
  <div class="section">
    <h2 class="section-title">Recommendations</h2>
    <div class="content-block">
      <h3>{recommended_action['title']}</h3>
      <p>{recommended_action['description']}</p>
    </div>
  </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Predictive Analysis Report – SimuCast</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.8; color: #000; background: #fff;
      padding: 60px 80px; max-width: 1000px; margin: 0 auto;
    }}
    .header {{
      text-align: center; margin-bottom: 40px;
      padding-bottom: 20px; border-bottom: 2px solid #000;
    }}
    .header h1 {{ font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }}
    .section {{ margin-bottom: 35px; }}
    .section-title {{
      font-size: 16px; font-weight: bold; text-transform: uppercase;
      margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333;
    }}
    .outcome-summary {{
      margin: 20px 0; padding: 20px;
      border: 1px solid #000; background: #f9f9f9;
    }}
    .outcome-row {{ display: flex; justify-content: space-between; margin-bottom: 15px; }}
    .outcome-label {{ font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 4px; }}
    .outcome-value {{ font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; }}
    table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }}
    th {{ background: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; border: 1px solid #000; }}
    td {{ padding: 10px 12px; border: 1px solid #ccc; }}
    tr:nth-child(even) {{ background: #fafafa; }}
    .content-block {{
      margin: 20px 0; padding: 20px;
      background: #f9f9f9; border-left: 3px solid #000;
    }}
    .content-block h3 {{
      font-size: 14px; font-weight: bold;
      margin-bottom: 12px; text-transform: uppercase;
    }}
    .content-block p {{ margin-bottom: 12px; text-align: justify; }}
    .disclaimer {{
      margin-top: 40px; padding: 20px;
      border: 2px solid #000; background: #f5f5f5; font-size: 11px;
    }}
    .disclaimer h3 {{ font-size: 12px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; }}
    .disclaimer p {{ margin-bottom: 10px; text-align: justify; }}
    .footer {{
      margin-top: 50px; padding-top: 20px;
      border-top: 1px solid #000; text-align: center; font-size: 11px; color: #666;
    }}
    @media print {{
      body {{ padding: 40px 60px; }}
    }}
  </style>
</head>
<body>
  <div class="header">
    <h1>Predictive Analysis Report</h1>
    <div style="font-size: 14px; margin-top: 6px;">SimuCast – Predictive Modelling &amp; Scenario Analysis Platform</div>
    <div style="font-size: 12px; margin-top: 15px;">Report Generated: {now}</div>
  </div>

  <div class="section">
    <h2 class="section-title">Report Metadata</h2>
    <table>
      <tr><td><strong>Dataset Name</strong></td><td>{dataset_name}</td></tr>
      <tr><td><strong>Predictive Model</strong></td><td>{model_type}</td></tr>
      <tr><td><strong>Target Variable</strong></td><td>{target_label}</td></tr>
      <tr><td><strong>Scenario Name</strong></td><td>{scenario.get('name', 'Scenario 1')}</td></tr>
      <tr><td><strong>Analysis Date</strong></td><td>{scenario.get('date', datetime.now().strftime('%Y-%m-%d'))}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="outcome-summary">
      <div class="outcome-row">
        <div>
          <div class="outcome-label">Baseline {target_label}</div>
          <div class="outcome-value">{baseline_outcome:.2f}%</div>
        </div>
        <div>
          <div class="outcome-label">Predicted {target_label}</div>
          <div class="outcome-value">{outcome:.2f}%</div>
        </div>
        <div style="text-align: right;">
          <div class="outcome-label">Change from Baseline</div>
          <div class="outcome-value">{change_sign}{outcome_change:.2f}%</div>
        </div>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
        <strong>Interpretation:</strong>
        {"The scenario predicts an improvement of " + f"{abs(outcome_change):.2f}%" + " compared to baseline conditions."
          if is_positive else
          "The scenario predicts a decline of " + f"{abs(outcome_change):.2f}%" + " compared to baseline conditions."}
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Scenario Configuration</h2>
    <table>
      <thead>
        <tr><th>Parameter</th><th>Scenario Value</th><th>Baseline (Mean)</th><th>Change</th></tr>
      </thead>
      <tbody>
        {param_rows_html}
      </tbody>
    </table>
  </div>

  {insight_block}
  {action_block}

  <div class="section">
    <h2 class="section-title">Methodology</h2>
    <p><strong>Model:</strong> {model_type} &nbsp;|&nbsp;
       <strong>Dataset:</strong> {dataset_name} &nbsp;|&nbsp;
       <strong>Target:</strong> {target_label}</p>
    <p style="margin-top: 12px; text-align: justify;">
      This analysis employs predictive modelling techniques to estimate the likely outcome of the
      specified scenario. The {model_type} model was trained on historical data from the {dataset_name}
      dataset to identify patterns and relationships between input variables and the target outcome.
      The baseline outcome represents the model's prediction when all features are held at their
      training-data means. Predictions assume that the learned relationships hold under the simulated conditions.
    </p>
  </div>

  <div class="disclaimer">
    <h3>Limitations and Considerations</h3>
    <p><strong>1. Predictive Uncertainty:</strong> Predictions represent probable outcomes under stated
       assumptions and cannot guarantee future results. Actual outcomes may vary.</p>
    <p><strong>2. Data Dependency:</strong> Accuracy depends on the quality and representativeness of
       the training dataset.</p>
    <p><strong>3. Decision Support Tool:</strong> This analysis is intended to inform decision-making,
       not replace professional judgment. Consider institutional context, constraints, and ethical
       implications when interpreting results.</p>
    <p><strong>4. Model Scope:</strong> The model captures relationships present in historical data but
       may not account for novel interventions or changing circumstances not represented in training data.</p>
  </div>

  <div class="footer">
    <p><strong>SimuCast</strong> – Predictive Modelling and What-If Analysis Platform</p>
    <p>This document is confidential and intended for authorised recipients only.</p>
  </div>
</body>
</html>"""
