import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';
import { Play, Save, RefreshCw, ArrowRight, BarChart as BarChartIcon, LineChartIcon, Lightbulb, Database, Brain, Shuffle, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { AppState } from '../App';
import { AuthUser } from './auth/AuthHeader';

interface WhatIfScenariosProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

// Baseline data structure
const baselineData = [
  { week: 'Week 1', baseline: 65, scenario: 65, weekNumber: 1 },
  { week: 'Week 2', baseline: 67, scenario: 67, weekNumber: 2 },
  { week: 'Week 3', baseline: 68, scenario: 68, weekNumber: 3 },
  { week: 'Week 4', baseline: 70, scenario: 70, weekNumber: 4 },
  { week: 'Week 5', baseline: 71, scenario: 71, weekNumber: 5 },
  { week: 'Week 6', baseline: 72, scenario: 72, weekNumber: 6 },
  { week: 'Week 7', baseline: 73, scenario: 73, weekNumber: 7 },
  { week: 'Week 8', baseline: 74, scenario: 74, weekNumber: 8 },
];

export default function WhatIfScenarios({ onNavigate, appState, updateAppState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: WhatIfScenariosProps) {
  // Scenario Configuration State
  const [studyHours, setStudyHours] = useState(15);
  const [attendanceRate, setAttendanceRate] = useState(75);
  const [tutorialSessions, setTutorialSessions] = useState(2);
  const [assignmentCompletion, setAssignmentCompletion] = useState(80);
  
  // Scenario Execution State
  const [scenarioRun, setScenarioRun] = useState(false);
  const [simulationData, setSimulationData] = useState(baselineData);
  
  // Visualization State - Target Variable Only
  const [visualizationType, setVisualizationType] = useState<'summary' | 'bar' | 'trend'>('summary');
  const [showVisualization, setShowVisualization] = useState(false);
  
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Detect if dataset has time dimension (simplified - in real app would check actual dataset)
  const hasTimeDimension = appState.selectedDataset?.name.toLowerCase().includes('time') || 
                           appState.selectedDataset?.name.toLowerCase().includes('longitudinal') ||
                           true; // For demo purposes, assume time-series data is available

  // Handle running the scenario simulation
  const handleRunScenario = () => {
    // Calculate impact based on parameter changes from baseline
    const studyImpact = (studyHours - 15) * 0.5;
    const attendanceImpact = (attendanceRate - 75) * 0.3;
    const tutorialImpact = (tutorialSessions - 2) * 2;
    const assignmentImpact = (assignmentCompletion - 80) * 0.2;
    
    const totalImpact = studyImpact + attendanceImpact + tutorialImpact + assignmentImpact;
    
    // Generate new scenario data
    const newData = baselineData.map(item => ({
      ...item,
      scenario: Math.min(100, Math.max(0, item.baseline + totalImpact)),
      studyHours: studyHours,
      attendance: attendanceRate,
      tutorials: tutorialSessions,
      assignments: assignmentCompletion,
    }));
    
    setSimulationData(newData);
    setScenarioRun(true);
    setShowVisualization(false); // Reset visualization
    toast.success('Scenario executed successfully!');
  };

  // Handle resetting to baseline
  const handleReset = () => {
    setStudyHours(15);
    setAttendanceRate(75);
    setTutorialSessions(2);
    setAssignmentCompletion(80);
    setSimulationData(baselineData);
    setScenarioRun(false);
    setShowVisualization(false);
    toast.info('Reset to baseline values');
  };

  // Handle visualization selection
  const handleSelectVisualization = (type: 'summary' | 'bar' | 'trend') => {
    if (!scenarioRun) {
      toast.error('Please run a scenario first');
      return;
    }
    
    if (type === 'trend' && !hasTimeDimension) {
      toast.error('Trend view is only available for time-series datasets');
      return;
    }
    
    setVisualizationType(type);
    setShowVisualization(true);
    toast.success(`${type === 'summary' ? 'Summary' : type === 'bar' ? 'Bar Comparison' : 'Trend'} view displayed`);
  };

  // Render the outcome visualization based on selected type
  const renderOutcomeVisualization = () => {
    const targetLabel = appState.targetVariableLabel || 'Performance Score';
    const finalOutcome = simulationData[simulationData.length - 1].scenario;
    const finalBaseline = baselineData[baselineData.length - 1].baseline;
    
    switch (visualizationType) {
      case 'summary':
        // Already shown in the outcome card above - no additional visualization needed
        return null;
      
      case 'bar':
        // Bar comparison of baseline vs scenario
        const comparisonData = [
          { category: 'Baseline', value: finalBaseline },
          { category: 'Scenario', value: finalOutcome }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="category"
                stroke="#64748b"
              />
              <YAxis 
                label={{ value: targetLabel, angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
                domain={[0, 100]}
              />
              <Tooltip />
              <Bar 
                dataKey="value"
                radius={[8, 8, 0, 0]}
              >
                <Cell fill="#94a3b8" />
                <Cell fill="#FE9A00" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'trend':
        // Trend view over time - only target variable
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="week"
                stroke="#64748b"
              />
              <YAxis 
                label={{ value: targetLabel, angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Baseline"
                dot={{ fill: '#94a3b8', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="scenario" 
                stroke="#FE9A00" 
                strokeWidth={3}
                name="Scenario"
                dot={{ fill: '#FE9A00', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  // Save scenario
  const handleSaveScenario = () => {
    const outcomeChange = simulationData[simulationData.length - 1].scenario - baselineData[baselineData.length - 1].baseline;
    const scenario = {
      id: Date.now(),
      name: `Scenario ${appState.scenarios.length + 1}`,
      date: new Date().toLocaleDateString(),
      datasetName: appState.selectedDataset?.name || 'Unknown Dataset',
      modelUsed: appState.selectedModel || 'Unknown Model',
      parameters: {
        studyHours,
        attendanceRate,
        tutorialSessions,
        assignmentCompletion,
      },
      outcome: simulationData[simulationData.length - 1].scenario,
      outcomeChange: outcomeChange,
      selected: false,
    };
    updateAppState({ 
      scenarios: [...appState.scenarios, scenario],
      currentScenario: scenario
    });
    toast.success('Scenario saved successfully!');
  };

  const handleToggleScenarioForReport = (scenarioId: number) => {
    const selectedIds = appState.selectedScenariosForReport;
    const newSelectedIds = selectedIds.includes(scenarioId)
      ? selectedIds.filter(id => id !== scenarioId)
      : [...selectedIds, scenarioId];
    
    updateAppState({ selectedScenariosForReport: newSelectedIds });
  };

  const handleProceedToReporting = () => {
    if (appState.selectedScenariosForReport.length === 0) {
      toast.error('Please select at least one scenario for reporting');
      return;
    }
    toast.success(`${appState.selectedScenariosForReport.length} scenario(s) selected for reporting`);
    onNavigate('reports');
  };

  const outcomeChange = scenarioRun 
    ? simulationData[simulationData.length - 1].scenario - baselineData[baselineData.length - 1].baseline
    : 0;

  // Check if we need to show the empty state
  const hasNoData = !appState.selectedDataset || !appState.selectedModel;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="scenarios" 
        onNavigate={onNavigate} 
        appState={appState} 
        onWatchDemo={onWatchDemo}
        user={user}
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        onLogout={onLogout}
      />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={3} isGuest={user?.isGuest || false} onStepClick={(step) => {
          if (step === 1) onNavigate('overview');
          else if (step === 2) onNavigate('modeling');
          else if (step === 3) onNavigate('scenarios');
        }} />
        
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Test Scenarios</h1>
            <p className="text-slate-600">Adjust variables to explore how changes impact predicted outcomes</p>
            {appState.selectedDataset && appState.selectedModel && (
              <p className="text-sm text-slate-500 mt-2">
                Using trained model: <span className="font-medium">{appState.selectedModel}</span> on <span className="font-medium">{appState.selectedDataset.name}</span>
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
                      <Shuffle className="w-10 h-10 text-amber-600" />
                    </div>
                    
                    <h2 className="text-2xl mb-3">No Data or Model Selected</h2>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                      To run what-if scenario simulations, you need to first upload a dataset and build a predictive model.
                    </p>

                    {/* Prerequisites Checklist */}
                    <div className="bg-slate-50 rounded-lg p-6 mb-8 max-w-lg mx-auto">
                      <h3 className="font-medium mb-4 text-left">Prerequisites:</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${appState.datasets.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {appState.datasets.length > 0 ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
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
                          <div className={`mt-1 ${appState.selectedModel ? 'text-amber-600' : 'text-slate-400'}`}>
                            {appState.selectedModel ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
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
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {appState.datasets.length === 0 ? (
                        <Button
                          size="lg"
                          onClick={() => onNavigate('overview')}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        >
                          <Database size={18} className="mr-2" />
                          Upload Dataset
                        </Button>
                      ) : !appState.selectedModel ? (
                        <Button
                          size="lg"
                          onClick={() => onNavigate('modeling')}
                          className="bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600"
                        >
                          <Brain size={18} className="mr-2" />
                          Build Model
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
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left text-sm text-slate-700">
                          <p className="font-medium mb-1">What are What-If Scenarios?</p>
                          <p className="text-slate-600">
                            Test different interventions to see how they might impact outcomes. Configure variables, run scenarios, and generate custom visualizations for analysis.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Variable Context Banner */}
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-1">
                        Scenario Outcome: Predicted <span className="text-blue-700">{appState.targetVariableLabel || 'Performance Score'}</span>
                      </h3>
                      <p className="text-sm text-slate-600">
                        Scenario testing evaluates how adjustments to input variables affect the predicted target variable.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 1: Scenario Configuration Panel */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">1</div>
                    <CardTitle>Scenario Configuration</CardTitle>
                  </div>
                  <p className="text-sm text-slate-500 ml-10">Adjust input variables to configure your scenario</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Study Hours */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Study Hours per Week</Label>
                        <Badge variant="outline" className="font-mono">{studyHours} hrs</Badge>
                      </div>
                      <Slider
                        value={[studyHours]}
                        onValueChange={(value) => setStudyHours(value[0])}
                        min={5}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>5 hrs</span>
                        <span className="font-medium">Baseline: 15 hrs</span>
                        <span>40 hrs</span>
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Attendance Rate</Label>
                        <Badge variant="outline" className="font-mono">{attendanceRate}%</Badge>
                      </div>
                      <Slider
                        value={[attendanceRate]}
                        onValueChange={(value) => setAttendanceRate(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0%</span>
                        <span className="font-medium">Baseline: 75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Tutorial Sessions */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Tutorial Sessions per Month</Label>
                        <Badge variant="outline" className="font-mono">{tutorialSessions} sessions</Badge>
                      </div>
                      <Slider
                        value={[tutorialSessions]}
                        onValueChange={(value) => setTutorialSessions(value[0])}
                        min={0}
                        max={8}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0</span>
                        <span className="font-medium">Baseline: 2</span>
                        <span>8</span>
                      </div>
                    </div>

                    {/* Assignment Completion */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Assignment Completion</Label>
                        <Badge variant="outline" className="font-mono">{assignmentCompletion}%</Badge>
                      </div>
                      <Slider
                        value={[assignmentCompletion]}
                        onValueChange={(value) => setAssignmentCompletion(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0%</span>
                        <span className="font-medium">Baseline: 80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Scenario Execution */}
              <Card className={scenarioRun ? 'border-teal-200 bg-teal-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${scenarioRun ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>2</div>
                    <CardTitle>Scenario Execution</CardTitle>
                    {scenarioRun && (
                      <Badge className="ml-auto bg-teal-600">Scenario Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 ml-10">Run your configured scenario to generate predictions</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg"
                      onClick={handleRunScenario}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      <Play size={20} className="mr-2" />
                      Run Scenario
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                    >
                      <RefreshCw size={18} className="mr-2" />
                      Reset to Baseline
                    </Button>
                    
                    {scenarioRun && (
                      <div className="ml-auto flex items-center gap-6 bg-white rounded-lg px-6 py-3 border border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Predicted Outcome</p>
                          <p className="text-2xl font-mono">{simulationData[simulationData.length - 1].scenario.toFixed(1)}%</p>
                        </div>
                        <div className={`${outcomeChange >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          <p className="text-xs mb-1">Change from Baseline</p>
                          <p className="text-2xl font-mono">
                            {outcomeChange >= 0 ? '+' : ''}{outcomeChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!scenarioRun && (
                    <div className="mt-4 flex items-start gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p>Configure the variables above, then click "Run Scenario" to execute the simulation and generate predictions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 3: Scenario Outcome Visualization (only shown after scenario is run) */}
              {scenarioRun && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">3</div>
                      <CardTitle>Scenario Outcome Visualization</CardTitle>
                    </div>
                    <p className="text-sm text-slate-500 ml-10">
                      Visualization options show different presentations of the predicted target variable under the simulated scenario.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Primary Outcome Display - Always Visible */}
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Predicted Target Variable</p>
                            <h3 className="text-3xl font-mono text-teal-700 mb-1">
                              {simulationData[simulationData.length - 1].scenario.toFixed(1)}%
                            </h3>
                            <p className="text-xs text-slate-500">{appState.targetVariableLabel || 'Performance Score'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600 mb-1">Change from Baseline</p>
                            <h3 className={`text-3xl font-mono ${outcomeChange >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                              {outcomeChange >= 0 ? '+' : ''}{outcomeChange.toFixed(1)}%
                            </h3>
                            <p className="text-xs text-slate-500">Baseline: {baselineData[baselineData.length - 1].baseline.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Visualization Type Selector */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Select Visualization Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Summary View */}
                          <button
                            onClick={() => handleSelectVisualization('summary')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              visualizationType === 'summary' && showVisualization
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                visualizationType === 'summary' && showVisualization ? 'bg-blue-500' : 'bg-slate-200'
                              }`}>
                                <TrendingUp className={`w-5 h-5 ${
                                  visualizationType === 'summary' && showVisualization ? 'text-white' : 'text-slate-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Summary View</p>
                                <p className="text-xs text-slate-500">Numeric result display</p>
                              </div>
                            </div>
                          </button>

                          {/* Bar Comparison */}
                          <button
                            onClick={() => handleSelectVisualization('bar')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              visualizationType === 'bar' && showVisualization
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                visualizationType === 'bar' && showVisualization ? 'bg-blue-500' : 'bg-slate-200'
                              }`}>
                                <BarChartIcon className={`w-5 h-5 ${
                                  visualizationType === 'bar' && showVisualization ? 'text-white' : 'text-slate-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Bar Comparison</p>
                                <p className="text-xs text-slate-500">Baseline vs Scenario</p>
                              </div>
                            </div>
                          </button>

                          {/* Trend View */}
                          <button
                            onClick={() => handleSelectVisualization('trend')}
                            disabled={!hasTimeDimension}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              !hasTimeDimension 
                                ? 'opacity-50 cursor-not-allowed bg-slate-50' 
                                : visualizationType === 'trend' && showVisualization
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                visualizationType === 'trend' && showVisualization ? 'bg-blue-500' : 'bg-slate-200'
                              }`}>
                                <LineChartIcon className={`w-5 h-5 ${
                                  visualizationType === 'trend' && showVisualization ? 'text-white' : 'text-slate-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Trend View</p>
                                <p className="text-xs text-slate-500">
                                  {hasTimeDimension ? 'Time-series' : 'Not available'}
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Chart Display */}
                      {showVisualization && renderOutcomeVisualization() && (
                        <div className="bg-white border border-slate-200 rounded-lg p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-medium">{appState.targetVariableLabel || 'Performance Score'} - {
                              visualizationType === 'summary' ? 'Summary' :
                              visualizationType === 'bar' ? 'Bar Comparison' :
                              'Trend Over Time'
                            }</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success('Chart download initiated')}
                            >
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                          </div>
                          <div ref={chartRef}>
                            {renderOutcomeVisualization()}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                        <Button
                          onClick={handleSaveScenario}
                          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                        >
                          <Save size={18} className="mr-2" />
                          Save Scenario
                        </Button>
                        <p className="text-sm text-slate-500">
                          Save this scenario configuration and outcome for reporting
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Saved Scenarios */}
              {appState.scenarios.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Scenarios ({appState.scenarios.length})</CardTitle>
                    <p className="text-sm text-slate-500">Select scenarios to include in your report</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appState.scenarios.map((scenario) => (
                        <div key={scenario.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border-2 border-transparent hover:border-teal-200 transition-colors">
                          <Checkbox
                            checked={appState.selectedScenariosForReport.includes(scenario.id)}
                            onCheckedChange={() => handleToggleScenarioForReport(scenario.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{scenario.name}</p>
                                <p className="text-xs text-slate-500">{scenario.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">Outcome ({appState.targetVariableLabel || 'Target'}): <span className="font-medium text-teal-600">{scenario.outcome.toFixed(1)}%</span></p>
                                <Badge className={scenario.outcomeChange >= 0 ? 'bg-amber-600' : 'bg-red-500'}>
                                  {scenario.outcomeChange >= 0 ? '+' : ''}{scenario.outcomeChange.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500">Dataset:</span>
                                <p className="font-medium text-slate-700">{scenario.datasetName}</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500">Model:</span>
                                <p className="font-medium text-slate-700">{scenario.modelUsed}</p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-500">Study Hours:</span> <span className="font-medium">{scenario.parameters.studyHours}h/week</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Attendance:</span> <span className="font-medium">{scenario.parameters.attendanceRate}%</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Tutorials:</span> <span className="font-medium">{scenario.parameters.tutorialSessions} sessions</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Assignments:</span> <span className="font-medium">{scenario.parameters.assignmentCompletion}%</span>
                              </div>
                            </div>

                            
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                      onClick={handleProceedToReporting}
                      disabled={appState.selectedScenariosForReport.length === 0}
                    >
                      Proceed to Reporting ({appState.selectedScenariosForReport.length} selected)
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Next Step CTA */}
              {scenarioRun && (
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-teal-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg mb-1">Ready to explore insights?</h3>
                        <p className="text-sm text-slate-600">
                          View automated insights and recommendations based on your scenario analysis.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => onNavigate('insights')}
                        className="bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700"
                      >
                        View Insights
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}