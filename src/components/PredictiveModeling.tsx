import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';
import { CheckCircle2, ArrowRight, Target, Database, ChevronDown, ChevronUp, Settings2, Brain, Lock, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { AppState } from '../App';
import { AuthUser } from './auth/AuthHeader';

interface PredictiveModelingProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

interface ModelMetrics {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
}

const targetVariables = [
  { value: 'final-grade', label: 'Final Grade', type: 'regression' },
  { value: 'pass-fail', label: 'Pass/Fail Status', type: 'classification' },
  { value: 'dropout-risk', label: 'Dropout Risk', type: 'classification' },
  { value: 'gpa', label: 'GPA Prediction', type: 'regression' },
];

export default function PredictiveModeling({ onNavigate, appState, updateAppState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: PredictiveModelingProps) {
  // Step 1: Dataset & Target Selection
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [targetVariable, setTargetVariable] = useState('');
  const [targetLocked, setTargetLocked] = useState(false);
  
  // Step 2: Automatic Model Evaluation
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  
  // Step 3 & 4: Model Comparison & Selection
  const [selectedModel, setSelectedModel] = useState('');
  const [recommendedModel, setRecommendedModel] = useState('');
  
  // Step 5: Parameter Tuning (Optional)
  const [isParameterTuningOpen, setIsParameterTuningOpen] = useState(false);
  const [maxDepth, setMaxDepth] = useState([10]);
  const [numEstimators, setNumEstimators] = useState([100]);
  const [trainTestSplit, setTrainTestSplit] = useState([80]);
  const [learningRate, setLearningRate] = useState([0.01]);
  
  // Step 6: Final Training
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);

  // Auto-select first dataset if available
  useEffect(() => {
    if (appState.datasets.length > 0 && !selectedDatasetId) {
      const firstDataset = appState.datasets[0];
      setSelectedDatasetId(firstDataset.id.toString());
      updateAppState({ selectedDataset: firstDataset });
    }
  }, [appState.datasets]);

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    const dataset = appState.datasets.find(d => d.id === parseInt(datasetId));
    if (dataset) {
      updateAppState({ selectedDataset: dataset });
    }
    // Reset workflow if dataset changes
    resetWorkflow();
  };

  const handleTargetVariableChange = (value: string) => {
    setTargetVariable(value);
    // Reset evaluation when target changes
    if (targetLocked) {
      resetWorkflow();
    }
  };

  const resetWorkflow = () => {
    setTargetLocked(false);
    setEvaluationComplete(false);
    setModelMetrics([]);
    setSelectedModel('');
    setRecommendedModel('');
    setTrainingComplete(false);
  };

  const handleConfirmTarget = () => {
    if (!targetVariable) {
      toast.error('Please select a target variable');
      return;
    }
    
    setTargetLocked(true);
    
    const targetInfo = targetVariables.find(t => t.value === targetVariable);
    toast.info(`Target locked: ${targetInfo?.label} (${targetInfo?.type})`);
    
    // Automatically start model evaluation
    setTimeout(() => {
      handleEvaluateModels();
    }, 500);
  };

  const handleEvaluateModels = () => {
    setIsEvaluating(true);
    toast.info('Evaluating all models with default parameters...');
    
    // Simulate model evaluation (in real app, this would call backend)
    setTimeout(() => {
      // Generate realistic metrics based on target type
      const targetInfo = targetVariables.find(t => t.value === targetVariable);
      const isClassification = targetInfo?.type === 'classification';
      
      const metrics: ModelMetrics[] = [
        {
          model: 'Logistic Regression',
          accuracy: isClassification ? 78 : 0,
          precision: isClassification ? 76 : 0,
          recall: isClassification ? 74 : 0,
          f1Score: isClassification ? 75 : 0,
          trainingTime: 0.3,
        },
        {
          model: 'Decision Tree',
          accuracy: 87,
          precision: 85,
          recall: 84,
          f1Score: 84.5,
          trainingTime: 0.5,
        },
        {
          model: 'Random Forest',
          accuracy: 92,
          precision: 90,
          recall: 91,
          f1Score: 90.5,
          trainingTime: 2.1,
        },
        {
          model: 'Support Vector Machine',
          accuracy: 88,
          precision: 86,
          recall: 87,
          f1Score: 86.5,
          trainingTime: 1.8,
        },
        {
          model: 'Gradient Boosting',
          accuracy: 94,
          precision: 93,
          recall: 92,
          f1Score: 92.5,
          trainingTime: 3.2,
        },
      ];
      
      // If regression, adjust metrics
      if (!isClassification) {
        metrics.forEach(m => {
          // For regression, we'd typically use different metrics (R², RMSE, MAE)
          // But for simplicity, we'll keep the same structure with adjusted values
          m.accuracy = m.f1Score; // Use F1 as a proxy for overall performance
        });
      }
      
      setModelMetrics(metrics);
      
      // Determine recommended model (highest F1-score)
      const best = metrics.reduce((prev, current) => 
        current.f1Score > prev.f1Score ? current : prev
      );
      setRecommendedModel(best.model);
      setSelectedModel(best.model);
      
      setIsEvaluating(false);
      setEvaluationComplete(true);
      
      toast.success('Model evaluation complete!');
    }, 2500);
  };

  const handleTrainFinalModel = () => {
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }
    
    setIsTraining(true);
    toast.info(`Training ${selectedModel}...`);
    
    setTimeout(() => {
      const selectedMetrics = modelMetrics.find(m => m.model === selectedModel);
      const targetInfo = targetVariables.find(t => t.value === targetVariable);
      
      // Save to app state
      updateAppState({
        selectedModel: selectedModel,
        targetVariable: targetVariable,
        targetVariableLabel: targetInfo?.label || '',
        modelResults: {
          modelType: selectedModel,
          accuracy: selectedMetrics?.accuracy || 0,
          precision: selectedMetrics?.precision || 0,
          recall: selectedMetrics?.recall || 0,
          f1Score: selectedMetrics?.f1Score || 0,
        }
      });
      
      setIsTraining(false);
      setTrainingComplete(true);
      
      toast.success('Model trained successfully!', {
        description: 'Your model is ready for scenario testing'
      });
    }, 2000);
  };

  const getPredictionTaskType = () => {
    const targetInfo = targetVariables.find(t => t.value === targetVariable);
    return targetInfo?.type || 'unknown';
  };

  // Prepare data for bar chart
  const chartData = modelMetrics.map(m => ({
    name: m.model.replace(' ', '\n'),
    Accuracy: m.accuracy,
    Precision: m.precision,
    Recall: m.recall,
    'F1-Score': m.f1Score,
  }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="modeling" 
        onNavigate={onNavigate} 
        appState={appState} 
        onWatchDemo={onWatchDemo}
        user={user}
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        onLogout={onLogout}
      />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={2} isGuest={user?.isGuest || false} onStepClick={(step) => {
          if (step === 1) onNavigate('overview');
          else if (step === 2) onNavigate('modeling');
        }} />
        
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Build Predictive Model</h1>
            <p className="text-slate-600">Select your target variable and compare model performance to choose the best approach</p>
          </div>

          {/* No Datasets Warning */}
          {appState.datasets.length === 0 && (
            <Card className="border-2 border-dashed border-slate-300">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-teal-100 rounded-full mb-6">
                    <Database className="w-10 h-10 text-amber-600" />
                  </div>
                  
                  <h2 className="text-2xl mb-3">No Datasets Available</h2>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    You need to upload a dataset before building predictive models.
                  </p>

                  <Button
                    size="lg"
                    onClick={() => onNavigate('overview')}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                  >
                    <Database size={18} className="mr-2" />
                    Upload Dataset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Workflow */}
          {appState.datasets.length > 0 && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Step 1: Dataset & Target Selection */}
              <Card className={targetLocked ? 'border-green-200 bg-green-50/30' : 'border-amber-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${targetLocked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {targetLocked ? <CheckCircle2 size={18} /> : '1'}
                      </div>
                      <CardTitle>Dataset & Target Selection</CardTitle>
                    </div>
                    {targetLocked && (
                      <Badge className="bg-green-600 flex items-center gap-1">
                        <Lock size={12} />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 ml-10">Choose your dataset and define what you want to predict</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dataset Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Database size={16} className="text-teal-600" />
                        Dataset
                      </Label>
                      <Select 
                        value={selectedDatasetId} 
                        onValueChange={handleDatasetChange}
                        disabled={targetLocked}
                      >
                        <SelectTrigger className={targetLocked ? 'bg-slate-100' : ''}>
                          <SelectValue placeholder="Choose a dataset" />
                        </SelectTrigger>
                        <SelectContent>
                          {appState.datasets.map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.id.toString()}>
                              {dataset.name} ({dataset.records.toLocaleString()} records)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedDatasetId && appState.selectedDataset && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Records:</span>
                              <span className="ml-1 font-medium">{appState.selectedDataset.records.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Quality:</span>
                              <span className="ml-1 font-medium">{appState.selectedDataset.quality}%</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Type:</span>
                              <span className="ml-1 font-medium">{appState.selectedDataset.type}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Status:</span>
                              <Badge className="ml-1 h-5 bg-green-500 text-xs">{appState.selectedDataset.status}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Variable Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Target size={16} className="text-amber-600" />
                        Target Variable (What to predict)
                      </Label>
                      <Select 
                        value={targetVariable} 
                        onValueChange={handleTargetVariableChange}
                        disabled={targetLocked}
                      >
                        <SelectTrigger className={targetLocked ? 'bg-slate-100' : ''}>
                          <SelectValue placeholder="Select target variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetVariables.map((target) => (
                            <SelectItem key={target.value} value={target.value}>
                              {target.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {targetVariable && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                          <div className="text-xs">
                            <p className="font-medium mb-1">Prediction Task:</p>
                            <p className="text-slate-700 capitalize">{getPredictionTaskType()}</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        The target variable determines what your model will predict. Once locked, all models will be evaluated against this target.
                      </p>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  {!targetLocked && targetVariable && selectedDatasetId && (
                    <div className="mt-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700">
                        Ready to proceed? This will lock your target variable and evaluate all models.
                      </p>
                      <Button
                        onClick={handleConfirmTarget}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Lock size={16} className="mr-2" />
                        Confirm & Evaluate Models
                      </Button>
                    </div>
                  )}

                  {/* Change Target Button */}
                  {targetLocked && (
                    <div className="mt-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700">
                        Target variable is locked. To change it, reset the workflow.
                      </p>
                      <Button
                        onClick={resetWorkflow}
                        variant="outline"
                        className="border-green-300 hover:bg-green-100"
                      >
                        Reset Workflow
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Automatic Model Evaluation */}
              {isEvaluating && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-4 py-8">
                      <Loader2 size={32} className="text-blue-600 animate-spin" />
                      <div>
                        <p className="font-medium text-lg">Evaluating Models</p>
                        <p className="text-sm text-slate-600">
                          Comparing all supported models with default parameters...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Model Comparison */}
              {evaluationComplete && !isEvaluating && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex-shrink-0">2</div>
                      <CardTitle>Performance Comparison Across Models</CardTitle>
                    </div>
                    <p className="text-sm text-slate-500 ml-10">All models evaluated using {trainTestSplit[0]}% training / {100 - trainTestSplit[0]}% testing split</p>
                  </CardHeader>
                  <CardContent>
                    {/* Metrics Table */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-medium">Model</th>
                            <th className="text-right py-3 px-4 font-medium">Accuracy</th>
                            <th className="text-right py-3 px-4 font-medium">Precision</th>
                            <th className="text-right py-3 px-4 font-medium">Recall</th>
                            <th className="text-right py-3 px-4 font-medium">F1-Score</th>
                            <th className="text-right py-3 px-4 font-medium">Training Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modelMetrics.map((metric) => {
                            const isRecommended = metric.model === recommendedModel;
                            const isSelected = metric.model === selectedModel;
                            
                            return (
                              <tr 
                                key={metric.model}
                                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-teal-50' : 'hover:bg-slate-50'
                                } ${isRecommended ? 'border-l-4 border-l-amber-500' : ''}`}
                                onClick={() => setSelectedModel(metric.model)}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {isSelected && (
                                      <CheckCircle2 size={16} className="text-teal-600" />
                                    )}
                                    <span className={isSelected ? 'font-medium' : ''}>
                                      {metric.model}
                                    </span>
                                    {isRecommended && (
                                      <Badge className="bg-amber-500 text-xs">Recommended</Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="text-right py-3 px-4 font-mono">{metric.accuracy.toFixed(1)}%</td>
                                <td className="text-right py-3 px-4 font-mono">{metric.precision.toFixed(1)}%</td>
                                <td className="text-right py-3 px-4 font-mono">{metric.recall.toFixed(1)}%</td>
                                <td className="text-right py-3 px-4 font-mono">{metric.f1Score.toFixed(1)}%</td>
                                <td className="text-right py-3 px-4 font-mono text-slate-500">{metric.trainingTime.toFixed(1)}s</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm font-medium mb-4">Performance Metrics Comparison</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            stroke="#64748b"
                            domain={[0, 100]}
                            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Accuracy" fill="#3b82f6" />
                          <Bar dataKey="Precision" fill="#10b981" />
                          <Bar dataKey="Recall" fill="#f59e0b" />
                          <Bar dataKey="F1-Score" fill="#14b8a6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Recommended Model */}
              {evaluationComplete && recommendedModel && (
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">3</div>
                      <CardTitle>Recommended Model</CardTitle>
                    </div>
                    <p className="text-sm text-slate-500 ml-10">Based on F1-Score performance</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-5 border border-amber-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-medium mb-2">{recommendedModel}</h3>
                          <p className="text-sm text-slate-600">
                            This model achieved the highest F1-Score ({modelMetrics.find(m => m.model === recommendedModel)?.f1Score.toFixed(1)}%), 
                            indicating the best balance between precision and recall for your prediction task.
                          </p>
                        </div>
                        <TrendingUp size={32} className="text-amber-600" />
                      </div>

                      {/* Recommended Model Metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        {(() => {
                          const metrics = modelMetrics.find(m => m.model === recommendedModel);
                          return (
                            <>
                              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                                <p className="text-lg font-mono">{metrics?.accuracy.toFixed(1)}%</p>
                              </div>
                              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Precision</p>
                                <p className="text-lg font-mono">{metrics?.precision.toFixed(1)}%</p>
                              </div>
                              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Recall</p>
                                <p className="text-lg font-mono">{metrics?.recall.toFixed(1)}%</p>
                              </div>
                              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">F1-Score</p>
                                <p className="text-lg font-mono">{metrics?.f1Score.toFixed(1)}%</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Selection Confirmation */}
                      <div className="mt-4 flex items-center justify-between bg-amber-100 border border-amber-300 rounded-lg p-3">
                        <p className="text-sm">
                          {selectedModel === recommendedModel ? (
                            <span className="font-medium text-green-700">Recommended model selected</span>
                          ) : (
                            <span className="text-slate-700">You can select a different model from the table above</span>
                          )}
                        </p>
                        {selectedModel !== recommendedModel && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedModel(recommendedModel)}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Use Recommended Model
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Optional Parameter Tuning */}
              {evaluationComplete && selectedModel && (
                <Collapsible open={isParameterTuningOpen} onOpenChange={setIsParameterTuningOpen}>
                  <Card className="border-slate-300">
                    <CardHeader>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex-shrink-0">4</div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <CardTitle>Parameter Tuning</CardTitle>
                                <Badge variant="outline" className="text-xs">Optional / Advanced</Badge>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">Fine-tune hyperparameters for the selected model</p>
                            </div>
                          </div>
                          {isParameterTuningOpen ? (
                            <ChevronUp className="text-slate-400" />
                          ) : (
                            <ChevronDown className="text-slate-400" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <Settings2 size={18} className="text-blue-600 mt-0.5" />
                            <div className="text-sm text-slate-700">
                              <p className="font-medium mb-1">Advanced Feature</p>
                              <p>
                                Default parameters work well for most cases. Adjust these only if you understand their impact on model performance.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Max Depth */}
                          {(selectedModel.includes('Tree') || selectedModel.includes('Forest') || selectedModel.includes('Boosting')) && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">Max Tree Depth</Label>
                                <Badge variant="outline" className="font-mono">{maxDepth[0]}</Badge>
                              </div>
                              <Slider
                                value={maxDepth}
                                onValueChange={setMaxDepth}
                                min={3}
                                max={30}
                                step={1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>3 (Simple)</span>
                                <span>30 (Complex)</span>
                              </div>
                            </div>
                          )}

                          {/* Number of Estimators */}
                          {(selectedModel.includes('Forest') || selectedModel.includes('Boosting')) && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">Number of Trees</Label>
                                <Badge variant="outline" className="font-mono">{numEstimators[0]}</Badge>
                              </div>
                              <Slider
                                value={numEstimators}
                                onValueChange={setNumEstimators}
                                min={10}
                                max={500}
                                step={10}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>10 (Fast)</span>
                                <span>500 (Accurate)</span>
                              </div>
                            </div>
                          )}

                          {/* Train/Test Split */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm">Training Data Split</Label>
                              <Badge variant="outline" className="font-mono">{trainTestSplit[0]}%</Badge>
                            </div>
                            <Slider
                              value={trainTestSplit}
                              onValueChange={setTrainTestSplit}
                              min={60}
                              max={90}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>60% Train</span>
                              <span>90% Train</span>
                            </div>
                          </div>

                          {/* Learning Rate */}
                          {(selectedModel.includes('Boosting') || selectedModel.includes('Neural')) && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">Learning Rate</Label>
                                <Badge variant="outline" className="font-mono">{learningRate[0].toFixed(3)}</Badge>
                              </div>
                              <Slider
                                value={learningRate}
                                onValueChange={setLearningRate}
                                min={0.001}
                                max={0.1}
                                step={0.001}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>0.001 (Slow)</span>
                                <span>0.1 (Fast)</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                          Note: Changing parameters will not re-evaluate models. Click "Train Selected Model" to apply these settings.
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Step 6: Final Model Training */}
              {evaluationComplete && selectedModel && (
                <Card className={trainingComplete ? 'border-teal-200 bg-teal-50/30' : 'border-blue-200'}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${trainingComplete ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                        {trainingComplete ? <CheckCircle2 size={18} /> : '5'}
                      </div>
                      <CardTitle>Final Model Training</CardTitle>
                    </div>
                    <p className="text-sm text-slate-500 ml-10">
                      {trainingComplete 
                        ? 'Model trained and ready for scenario testing' 
                        : 'Train your selected model with current parameters'
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    {!trainingComplete ? (
                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 mb-1">Selected Model:</p>
                              <p className="font-medium">{selectedModel}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Target Variable:</p>
                              <p className="font-medium">
                                {targetVariables.find(t => t.value === targetVariable)?.label}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Expected F1-Score:</p>
                              <p className="font-medium">
                                {modelMetrics.find(m => m.model === selectedModel)?.f1Score.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Estimated Training Time:</p>
                              <p className="font-medium">
                                {modelMetrics.find(m => m.model === selectedModel)?.trainingTime.toFixed(1)}s
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-slate-700 mb-1 font-medium">What happens when you train?</p>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Model will be trained on {trainTestSplit[0]}% of your dataset</li>
                            <li>Feature importance will be calculated for interpretation</li>
                            <li>Trained model will be available for scenario testing</li>
                          </ul>
                        </div>

                        <Button
                          size="lg"
                          onClick={handleTrainFinalModel}
                          disabled={isTraining}
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                        >
                          {isTraining ? (
                            <>
                              <Loader2 size={20} className="mr-2 animate-spin" />
                              Training Model...
                            </>
                          ) : (
                            <>
                              <Brain size={20} className="mr-2" />
                              Train Selected Model
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <CheckCircle2 size={32} className="text-teal-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-2">Model Training Complete!</h3>
                              <p className="text-sm text-slate-700 mb-4">
                                Your {selectedModel} model has been successfully trained and is ready to use for scenario testing.
                              </p>
                              
                              {/* Final Metrics */}
                              <div className="grid grid-cols-4 gap-3 mb-4">
                                {(() => {
                                  const metrics = modelMetrics.find(m => m.model === selectedModel);
                                  return (
                                    <>
                                      <div className="bg-white rounded p-3 border border-teal-200">
                                        <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                                        <p className="text-lg font-mono">{metrics?.accuracy.toFixed(1)}%</p>
                                      </div>
                                      <div className="bg-white rounded p-3 border border-teal-200">
                                        <p className="text-xs text-slate-500 mb-1">Precision</p>
                                        <p className="text-lg font-mono">{metrics?.precision.toFixed(1)}%</p>
                                      </div>
                                      <div className="bg-white rounded p-3 border border-teal-200">
                                        <p className="text-xs text-slate-500 mb-1">Recall</p>
                                        <p className="text-lg font-mono">{metrics?.recall.toFixed(1)}%</p>
                                      </div>
                                      <div className="bg-white rounded p-3 border border-teal-200">
                                        <p className="text-xs text-slate-500 mb-1">F1-Score</p>
                                        <p className="text-lg font-mono">{metrics?.f1Score.toFixed(1)}%</p>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Target Variable Confirmation */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Target size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                      Target Variable: <span className="text-blue-700">{targetVariables.find(t => t.value === targetVariable)?.label}</span>
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      This model will be used to simulate changes in the selected target variable during scenario testing.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Next Step CTA */}
                        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-teal-50">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg mb-1">Ready for scenario testing?</h3>
                                <p className="text-sm text-slate-600">
                                  Use your trained model to test what-if scenarios and explore different interventions.
                                </p>
                              </div>
                              <Button
                                size="lg"
                                onClick={() => onNavigate('scenarios')}
                                className="bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700"
                              >
                                Test Scenarios
                                <ArrowRight size={18} className="ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Option to Retrain */}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTrainingComplete(false);
                            updateAppState({ selectedModel: null, modelResults: null });
                            toast.info('You can now select a different model or adjust parameters');
                          }}
                          className="w-full"
                        >
                          Train Different Model
                        </Button>
                      </div>
                    )}
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