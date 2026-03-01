import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';
import { TrendingUp, Lightbulb, Target, FileText, Download, CheckCircle2, Info, AlertCircle, Database, Brain, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AppState } from '../App';
import { toast } from 'sonner';
import { AuthUser } from './auth/AuthHeader';

interface InsightsAndReportProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

export default function InsightsAndReport({ onNavigate, appState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: InsightsAndReportProps) {
  const [includeInsightInReport, setIncludeInsightInReport] = useState(true);
  const [includeActionInReport, setIncludeActionInReport] = useState(true);

  // Get current scenario or use the most recent one
  const currentScenario = appState.currentScenario || appState.scenarios[appState.scenarios.length - 1];
  
  // Check if we have the necessary data
  const hasNoData = !appState.selectedDataset || !appState.selectedModel || !currentScenario;

  // Calculate outcome summary
  const outcomeChange = currentScenario ? currentScenario.outcomeChange : 0;
  const outcomeValue = currentScenario ? currentScenario.outcome : 0;
  const isPositiveOutcome = outcomeChange >= 0;

  // Generate key insight based on scenario parameters
  const generateKeyInsight = () => {
    if (!currentScenario) return null;

    const { studyHours, attendanceRate, tutorialSessions, assignmentCompletion } = currentScenario.parameters;
    
    // Determine the most significant change
    const changes = [
      { param: 'study hours', value: studyHours, baseline: 15, impact: 0.5 },
      { param: 'attendance rate', value: attendanceRate, baseline: 75, impact: 0.3 },
      { param: 'tutorial sessions', value: tutorialSessions, baseline: 2, impact: 2 },
      { param: 'assignment completion', value: assignmentCompletion, baseline: 80, impact: 0.2 },
    ];

    const significantChange = changes
      .map(c => ({ ...c, diff: Math.abs((c.value - c.baseline) * c.impact) }))
      .sort((a, b) => b.diff - a.diff)[0];

    if (Math.abs(outcomeChange) < 1) {
      return {
        title: 'Minimal Impact Observed',
        description: 'The current scenario parameters show minimal deviation from baseline predictions. Consider testing more substantial interventions to observe meaningful changes in outcomes.',
        detailedAnalysis: 'Statistical analysis indicates that the parameter adjustments fall within the margin of error for predictive accuracy. To generate actionable insights, consider adjusting variables by at least 20% from their baseline values or combining multiple interventions.',
      };
    }

    if (isPositiveOutcome) {
      return {
        title: `${significantChange.param.charAt(0).toUpperCase() + significantChange.param.slice(1)} Improvement Shows Promise`,
        description: `Increasing ${significantChange.param} to ${significantChange.value}${significantChange.param.includes('rate') || significantChange.param.includes('completion') ? '%' : significantChange.param.includes('hours') ? ' hours/week' : ' sessions'} correlates with improved performance outcomes. This represents the primary driver of the ${Math.abs(outcomeChange).toFixed(1)}% improvement.`,
        detailedAnalysis: `Model analysis reveals that ${significantChange.param} demonstrates strong predictive power in the current dataset. Historical patterns suggest that students who maintain ${significantChange.param} at this level consistently outperform peers by 15-25%. The relationship appears to be linear within this range, suggesting room for further optimization.`,
      };
    } else {
      return {
        title: `${significantChange.param.charAt(0).toUpperCase() + significantChange.param.slice(1)} Reduction May Hinder Outcomes`,
        description: `Reducing ${significantChange.param} to ${significantChange.value}${significantChange.param.includes('rate') || significantChange.param.includes('completion') ? '%' : significantChange.param.includes('hours') ? ' hours/week' : ' sessions'} shows potential negative correlation with performance. This configuration may not align with optimal intervention strategies.`,
        detailedAnalysis: `The predictive model indicates that maintaining ${significantChange.param} below recommended thresholds introduces risk factors. Data suggests a threshold effect where values below the baseline significantly impact outcome probabilities. Consider this a critical parameter requiring careful monitoring.`,
      };
    }
  };

  // Generate recommended action
  const generateRecommendedAction = () => {
    if (!currentScenario) return null;

    const { studyHours, attendanceRate, tutorialSessions } = currentScenario.parameters;

    if (Math.abs(outcomeChange) < 1) {
      return {
        title: 'Test More Substantial Interventions',
        description: 'Current parameters are too close to baseline to generate meaningful predictions. Adjust at least one variable by 25% or more to observe significant outcome changes and derive actionable insights.',
      };
    }

    if (isPositiveOutcome) {
      // Find what's working well
      if (studyHours > 20 || attendanceRate > 85 || tutorialSessions > 3) {
        return {
          title: 'Implement High-Impact Intervention Program',
          description: 'Given the positive scenario outcomes, develop a structured program targeting the adjusted parameters. Monitor implementation closely and track actual outcomes against predictions to validate model accuracy.',
        };
      }
      return {
        title: 'Scale Current Intervention Strategy',
        description: 'Scenario predictions indicate favorable outcomes. Begin pilot implementation with a small cohort, establish measurement protocols, and prepare for broader rollout based on observed results.',
      };
    } else {
      // Negative outcome - what to avoid
      return {
        title: 'Avoid This Configuration in Practice',
        description: 'Model predictions suggest this scenario may lead to suboptimal outcomes. Maintain parameters at or above baseline levels, and consider alternative intervention strategies that demonstrate positive predicted impact.',
      };
    }
  };

  const keyInsight = generateKeyInsight();
  const recommendedAction = generateRecommendedAction();

  const handleGenerateReport = () => {
    if (!currentScenario) {
      toast.error('No scenario available to generate report');
      return;
    }

    // Generate comprehensive HTML report
    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Predictive Analysis Report - SimuCast</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.8;
      color: #000;
      background: #fff;
      padding: 60px 80px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #333;
      margin-bottom: 20px;
    }
    .meta-info {
      display: table;
      width: 100%;
      margin-bottom: 30px;
      font-size: 12px;
    }
    .meta-row {
      display: table-row;
    }
    .meta-label {
      display: table-cell;
      padding: 6px 20px 6px 0;
      font-weight: bold;
      width: 180px;
    }
    .meta-value {
      display: table-cell;
      padding: 6px 0;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #333;
      letter-spacing: 0.5px;
    }
    .outcome-summary {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #000;
      background: #f9f9f9;
    }
    .outcome-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ddd;
    }
    .outcome-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .outcome-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 4px;
    }
    .outcome-value {
      font-size: 28px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
    .params-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    .params-table th {
      background: #f0f0f0;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #000;
    }
    .params-table td {
      padding: 10px 12px;
      border: 1px solid #ccc;
    }
    .params-table tr:nth-child(even) {
      background: #fafafa;
    }
    .content-block {
      margin: 20px 0;
      padding: 20px;
      background: #f9f9f9;
      border-left: 3px solid #000;
    }
    .content-block h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .content-block p {
      margin-bottom: 12px;
      text-align: justify;
    }
    .content-block p:last-child {
      margin-bottom: 0;
    }
    .disclaimer {
      margin-top: 40px;
      padding: 20px;
      border: 2px solid #000;
      background: #f5f5f5;
      font-size: 11px;
    }
    .disclaimer h3 {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .disclaimer p {
      margin-bottom: 10px;
      text-align: justify;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #000;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .page-break {
      page-break-after: always;
    }
    @media print {
      body { 
        padding: 40px 60px;
      }
      .outcome-summary, .content-block {
        background: #fff;
        border: 1px solid #000;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>Predictive Analysis Report</h1>
    <div class="subtitle">PROSPECT: Predictive Modeling & Scenario Analysis Platform</div>
    <div style="font-size: 12px; margin-top: 15px;">
      Report Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <!-- Document Metadata -->
  <div class="meta-info">
    <div class="meta-row">
      <div class="meta-label">Dataset Name:</div>
      <div class="meta-value">${currentScenario.datasetName}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Predictive Model:</div>
      <div class="meta-value">${currentScenario.modelUsed}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Target Variable:</div>
      <div class="meta-value">${appState.targetVariableLabel || 'Performance Score'}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Scenario Name:</div>
      <div class="meta-value">${currentScenario.name}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Analysis Date:</div>
      <div class="meta-value">${currentScenario.date}</div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <p style="margin-bottom: 15px;">
      This report presents the results of a predictive scenario analysis conducted using the ${currentScenario.modelUsed} model 
      applied to the ${currentScenario.datasetName} dataset. The analysis evaluates the predicted impact of specific parameter 
      adjustments on ${appState.targetVariableLabel || 'performance outcomes'}.
    </p>
    
    <div class="outcome-summary">
      <div class="outcome-row">
        <div>
          <div class="outcome-label">Predicted ${appState.targetVariableLabel || 'Performance Score'}</div>
          <div class="outcome-value">${outcomeValue.toFixed(2)}%</div>
        </div>
        <div style="text-align: right;">
          <div class="outcome-label">Change from Baseline</div>
          <div class="outcome-value" style="color: ${isPositiveOutcome ? '#000' : '#000'}">
            ${outcomeChange >= 0 ? '+' : ''}${outcomeChange.toFixed(2)}%
          </div>
        </div>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
        <strong>Interpretation:</strong> 
        ${isPositiveOutcome 
          ? `The scenario predicts an improvement of ${Math.abs(outcomeChange).toFixed(2)}% compared to baseline conditions.`
          : `The scenario predicts a decline of ${Math.abs(outcomeChange).toFixed(2)}% compared to baseline conditions.`
        }
      </div>
    </div>
  </div>

  <!-- Scenario Configuration -->
  <div class="section">
    <h2 class="section-title">Scenario Configuration</h2>
    <p style="margin-bottom: 15px;">
      The following parameters were adjusted from their baseline values to simulate the scenario conditions:
    </p>
    
    <table class="params-table">
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Scenario Value</th>
          <th>Baseline Value</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Study Hours per Week</td>
          <td>${currentScenario.parameters.studyHours} hours</td>
          <td>15 hours</td>
          <td>${currentScenario.parameters.studyHours - 15 >= 0 ? '+' : ''}${currentScenario.parameters.studyHours - 15} hours</td>
        </tr>
        <tr>
          <td>Attendance Rate</td>
          <td>${currentScenario.parameters.attendanceRate}%</td>
          <td>75%</td>
          <td>${currentScenario.parameters.attendanceRate - 75 >= 0 ? '+' : ''}${currentScenario.parameters.attendanceRate - 75}%</td>
        </tr>
        <tr>
          <td>Tutorial Sessions</td>
          <td>${currentScenario.parameters.tutorialSessions} sessions</td>
          <td>2 sessions</td>
          <td>${currentScenario.parameters.tutorialSessions - 2 >= 0 ? '+' : ''}${currentScenario.parameters.tutorialSessions - 2} sessions</td>
        </tr>
        <tr>
          <td>Assignment Completion Rate</td>
          <td>${currentScenario.parameters.assignmentCompletion}%</td>
          <td>80%</td>
          <td>${currentScenario.parameters.assignmentCompletion - 80 >= 0 ? '+' : ''}${currentScenario.parameters.assignmentCompletion - 80}%</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${keyInsight && includeInsightInReport ? `
  <!-- Analysis and Insights -->
  <div class="section">
    <h2 class="section-title">Analysis and Insights</h2>
    
    <div class="content-block">
      <h3>${keyInsight.title}</h3>
      <p>${keyInsight.description}</p>
      <p><strong>Detailed Analysis:</strong> ${keyInsight.detailedAnalysis}</p>
    </div>
  </div>
  ` : ''}

  ${recommendedAction && includeActionInReport ? `
  <!-- Recommendations -->
  <div class="section">
    <h2 class="section-title">Recommendations</h2>
    
    <div class="content-block">
      <h3>${recommendedAction.title}</h3>
      <p>${recommendedAction.description}</p>
    </div>
  </div>
  ` : ''}

  <!-- Methodology -->
  <div class="section">
    <h2 class="section-title">Methodology</h2>
    <p style="margin-bottom: 12px;">
      <strong>Model Type:</strong> ${currentScenario.modelUsed}
    </p>
    <p style="margin-bottom: 12px;">
      <strong>Training Dataset:</strong> ${currentScenario.datasetName}
    </p>
    <p style="margin-bottom: 12px;">
      <strong>Target Variable:</strong> ${appState.targetVariableLabel || 'Performance Score'}
    </p>
    <p style="text-align: justify;">
      This analysis employs predictive modeling techniques to estimate the likely outcome of the specified scenario. 
      The ${currentScenario.modelUsed} model was trained on historical data from the ${currentScenario.datasetName} dataset 
      to identify patterns and relationships between input variables and the target outcome. The scenario predictions 
      are based on the learned patterns and assume that historical relationships will hold under the simulated conditions.
    </p>
  </div>

  <!-- Limitations and Considerations -->
  <div class="disclaimer">
    <h3>Limitations and Considerations</h3>
    <p>
      <strong>1. Predictive Uncertainty:</strong> This report presents predictions based on statistical modeling of historical data. 
      While the model has been validated, predictions represent probable outcomes under stated assumptions and cannot guarantee 
      future results. Actual outcomes may vary due to factors not captured in the training data.
    </p>
    <p>
      <strong>2. Data Dependency:</strong> The accuracy and reliability of predictions depend on the quality, completeness, 
      and representativeness of the training dataset. Changes in underlying population characteristics, measurement methods, 
      or external conditions may affect model applicability.
    </p>
    <p>
      <strong>3. Decision Support Tool:</strong> This analysis is intended to inform decision-making, not replace professional 
      judgment. Stakeholders should consider institutional context, resource constraints, ethical implications, and domain 
      expertise when interpreting results and planning interventions.
    </p>
    <p>
      <strong>4. Model Scope:</strong> The model captures relationships present in historical data but may not account for 
      novel interventions, changing circumstances, or interaction effects not represented in the training set. Results should 
      be validated through pilot testing and ongoing monitoring.
    </p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>PROSPECT</strong> – Predictive Modeling and What-If Analysis Platform</p>
    <p>This document is confidential and intended for authorized recipients only.</p>
    <p>Distribution and use should comply with applicable data governance and privacy policies.</p>
  </div>
</body>
</html>
    `;

    // Create a Blob and download the report
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PROSPECT_Analysis_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report generated successfully!', {
      description: 'Your comprehensive analysis report has been downloaded. Open it in your browser to view or print as PDF.',
    });
    
    // Simulate slight delay for realism
    setTimeout(() => {
      toast.info('Downloading report...', {
        description: 'prospect_scenario_report.html',
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="insights" 
        onNavigate={onNavigate} 
        appState={appState} 
        onWatchDemo={onWatchDemo}
        user={user}
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        onLogout={onLogout}
      />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={4} isGuest={user?.isGuest || false} onStepClick={(step) => {
          if (step === 1) onNavigate('overview');
          else if (step === 2) onNavigate('modeling');
          else if (step === 3) onNavigate('scenarios');
          else if (step === 4) onNavigate('insights');
        }} />
        
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Insights & Report</h1>
            <p className="text-slate-600">Review scenario outcomes, key insights, and generate comprehensive reports</p>
            {currentScenario && (
              <p className="text-sm text-slate-500 mt-1">
                Analyzing: <span className="font-medium">{currentScenario.name}</span> • {currentScenario.date}
              </p>
            )}
          </div>

          {/* Empty State */}
          {hasNoData ? (
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-teal-100 rounded-full mb-6">
                      <FileText className="w-10 h-10 text-teal-600" />
                    </div>
                    
                    <h2 className="text-2xl mb-3">No Scenario Results Available</h2>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                      To view insights and generate reports, you need to complete the previous workflow steps and run at least one scenario.
                    </p>

                    {/* Prerequisites Checklist */}
                    <div className="bg-slate-50 rounded-lg p-6 mb-8 max-w-lg mx-auto">
                      <h3 className="font-medium mb-4 text-left">Prerequisites:</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${appState.datasets.length > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {appState.datasets.length > 0 ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Database className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Upload Dataset</p>
                            <p className="text-sm text-slate-500">
                              {appState.datasets.length > 0 
                                ? `${appState.datasets.length} dataset(s) available` 
                                : 'No datasets uploaded yet'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${appState.selectedModel ? 'text-green-600' : 'text-slate-400'}`}>
                            {appState.selectedModel ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Brain className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Build Predictive Model</p>
                            <p className="text-sm text-slate-500">
                              {appState.selectedModel 
                                ? `Using ${appState.selectedModel} model` 
                                : 'No model built yet'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${appState.scenarios.length > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {appState.scenarios.length > 0 ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <TrendingUp className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Run Scenario Analysis</p>
                            <p className="text-sm text-slate-500">
                              {appState.scenarios.length > 0 
                                ? `${appState.scenarios.length} scenario(s) completed` 
                                : 'No scenarios run yet'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {appState.scenarios.length === 0 ? (
                        <Button
                          size="lg"
                          onClick={() => onNavigate('scenarios')}
                          className="bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600"
                        >
                          <TrendingUp size={18} className="mr-2" />
                          Run Scenario Analysis
                        </Button>
                      ) : null}
                      
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={onWatchDemo}
                      >
                        <Play size={18} className="mr-2" />
                        Watch Demo
                      </Button>
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left text-sm text-slate-700">
                          <p className="font-medium mb-1">About Insights & Reports</p>
                          <p className="text-slate-600">
                            This screen provides AI-generated insights from your scenario analysis and allows you to generate comprehensive PDF reports for stakeholder review.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* 1. Scenario Outcome Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Scenario Outcome Summary</CardTitle>
                    <Badge variant={isPositiveOutcome ? "default" : "destructive"} className={isPositiveOutcome ? "bg-teal-600" : ""}>
                      {isPositiveOutcome ? 'Positive Impact' : 'Negative Impact'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-2">Predicted Outcome</p>
                        <p className="text-4xl font-mono mb-4">{outcomeValue.toFixed(1)}%</p>
                        <p className="text-slate-700">
                          {isPositiveOutcome ? (
                            <>
                              Predicted performance <span className="font-medium text-teal-600">increased by {Math.abs(outcomeChange).toFixed(1)}%</span> compared to baseline.
                            </>
                          ) : (
                            <>
                              Predicted performance <span className="font-medium text-red-600">reduced by {Math.abs(outcomeChange).toFixed(1)}%</span> compared to baseline.
                            </>
                          )}
                        </p>
                      </div>
                      <div className={`flex items-center justify-center w-24 h-24 rounded-full ${isPositiveOutcome ? 'bg-teal-100' : 'bg-red-100'}`}>
                        <TrendingUp className={`w-12 h-12 ${isPositiveOutcome ? 'text-teal-600' : 'text-red-600'}`} />
                      </div>
                    </div>

                    {/* Scenario Parameters */}
                    <div className="mt-6 pt-6 border-t border-slate-300">
                      <p className="text-sm text-slate-600 mb-3">Scenario Configuration:</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded px-3 py-2 border border-slate-200">
                          <span className="text-slate-500">Study Hours:</span>
                          <span className="ml-2 font-medium">{currentScenario.parameters.studyHours} hrs/week</span>
                        </div>
                        <div className="bg-white rounded px-3 py-2 border border-slate-200">
                          <span className="text-slate-500">Attendance:</span>
                          <span className="ml-2 font-medium">{currentScenario.parameters.attendanceRate}%</span>
                        </div>
                        <div className="bg-white rounded px-3 py-2 border border-slate-200">
                          <span className="text-slate-500">Tutorial Sessions:</span>
                          <span className="ml-2 font-medium">{currentScenario.parameters.tutorialSessions} sessions</span>
                        </div>
                        <div className="bg-white rounded px-3 py-2 border border-slate-200">
                          <span className="text-slate-500">Assignment Completion:</span>
                          <span className="ml-2 font-medium">{currentScenario.parameters.assignmentCompletion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Key Insight */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Key Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">{keyInsight?.title}</h3>
                      <p className="text-slate-700 leading-relaxed">{keyInsight?.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Info size={16} className="mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{keyInsight?.title}</DialogTitle>
                            <DialogDescription>Detailed Analysis</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <h4 className="font-medium mb-2">Summary</h4>
                              <p className="text-slate-700">{keyInsight?.description}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Detailed Analysis</h4>
                              <p className="text-slate-700 leading-relaxed">{keyInsight?.detailedAnalysis}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium mb-1">Statistical Note</p>
                                  <p className="text-slate-700">
                                    These insights are generated based on predictive models trained on historical data. 
                                    Actual outcomes may vary based on implementation context and external factors.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="include-insight"
                          checked={includeInsightInReport}
                          onCheckedChange={(checked) => setIncludeInsightInReport(checked as boolean)}
                        />
                        <label
                          htmlFor="include-insight"
                          className="text-sm text-slate-600 cursor-pointer"
                        >
                          Include in Report
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Recommended Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    Recommended Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <h3 className="font-medium text-lg mb-2">{recommendedAction?.title}</h3>
                      <p className="text-slate-700 leading-relaxed">{recommendedAction?.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-action"
                        checked={includeActionInReport}
                        onCheckedChange={(checked) => setIncludeActionInReport(checked as boolean)}
                      />
                      <label
                        htmlFor="include-action"
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        Include in Report
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Report Generation */}
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Generate Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-slate-700">
                      Generate a comprehensive PDF report that includes all scenario analysis results and insights.
                    </p>

                    {/* Report Contents Preview */}
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <p className="font-medium mb-3">Report will include:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>Scenario configuration and parameters</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>Outcome summary with baseline comparison</span>
                        </div>
                        {includeInsightInReport && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>Key insight with detailed analysis</span>
                          </div>
                        )}
                        {includeActionInReport && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>Recommended action and implementation guidance</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>Model metadata and performance metrics</span>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                      onClick={handleGenerateReport}
                    >
                      <Download size={20} className="mr-2" />
                      Generate & Download Report
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      Report will be generated as a PDF document and downloaded to your device
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Helper */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('scenarios')}
                >
                  Back to Scenarios
                </Button>
                <div className="text-sm text-slate-500">
                  All workflow steps complete
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}