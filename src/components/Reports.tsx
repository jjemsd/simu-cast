import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';
import { FileText, Download, Presentation, Eye, Calendar, CheckCircle2, Database, TrendingUp, Target, BarChart, Share2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { AppState } from '../App';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { AuthUser } from './auth/AuthHeader';

interface ReportsProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

const reportTemplates = [
  {
    id: 1,
    name: 'Executive Summary',
    description: 'High-level overview of key findings and recommendations',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 2,
    name: 'Scenario Comparison',
    description: 'Detailed comparison of all simulated scenarios',
    icon: BarChart,
    color: 'teal',
  },
  {
    id: 3,
    name: 'Intervention Report',
    description: 'Action plan with prioritized interventions',
    icon: Target,
    color: 'amber',
  },
];

const generatedReports = [
  {
    id: 1,
    name: 'Fall 2024 Predictive Analysis',
    scenario: 'Increased Study Hours',
    type: 'Executive Summary',
    pages: 12,
    date: '2024-10-10',
    status: 'Ready',
  },
  {
    id: 2,
    name: 'Intervention Strategy Report',
    scenario: 'Multiple Scenarios',
    type: 'Intervention Report',
    pages: 18,
    date: '2024-10-08',
    status: 'Ready',
  },
  {
    id: 3,
    name: 'Q3 2024 Performance Review',
    scenario: 'Baseline Comparison',
    type: 'Scenario Comparison',
    pages: 15,
    date: '2024-09-28',
    status: 'Ready',
  },
];

export default function Reports({ onNavigate, appState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: ReportsProps) {
  const selectedScenarios = appState.scenarios.filter(s => 
    appState.selectedScenariosForReport.includes(s.id)
  );

  const handleExport = (format: 'pdf' | 'csv' | 'share') => {
    const formatLabels = {
      pdf: 'PDF',
      csv: 'CSV',
      share: 'Share Link'
    };
    toast.success(`Report exported as ${formatLabels[format]}`);
  };

  const modelPerformanceData = appState.modelResults ? [
    { metric: 'Accuracy', value: appState.modelResults.accuracy },
    { metric: 'Precision', value: appState.modelResults.precision },
    { metric: 'Recall', value: appState.modelResults.recall },
    { metric: 'F1 Score', value: appState.modelResults.f1Score },
  ] : [];

  const scenarioComparisonData = selectedScenarios.map((scenario, index) => ({
    name: `S${index + 1}`,
    fullName: scenario.name,
    outcome: scenario.outcome,
    change: scenario.outcomeChange,
  }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage="reports" onNavigate={onNavigate} appState={appState} onWatchDemo={onWatchDemo} user={user} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} onLogout={onLogout} />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={5} />
        
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Reports & Export</h1>
          <p className="text-slate-600">Generate comprehensive reports from your analysis and scenarios</p>
        </div>

        {/* Report Summary Section */}
        {selectedScenarios.length > 0 && (
          <div className="mb-8 space-y-6">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={24} />
                  Report Summary
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Comprehensive analysis of {selectedScenarios.length} selected scenario{selectedScenarios.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download size={18} className="mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('csv')}
                  >
                    <Download size={18} className="mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('share')}
                  >
                    <Share2 size={18} className="mr-2" />
                    Share Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dataset Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} className="text-blue-600" />
                  Dataset Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appState.selectedDataset ? (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Dataset Name</p>
                          <p className="font-medium">{appState.selectedDataset.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Total Records</p>
                          <p className="font-medium">{appState.selectedDataset.records.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Data Quality</p>
                          <p className="font-medium">{appState.selectedDataset.quality}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Data Type</p>
                          <Badge variant={appState.selectedDataset.type === 'Synthetic' ? 'default' : 'outline'}>
                            {appState.selectedDataset.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No dataset selected</p>
                  )}
                  
                  {appState.datasets.length > 0 && (
                    <div className="text-sm text-slate-600">
                      <p className="font-medium mb-2">All Available Datasets:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {appState.datasets.map(dataset => (
                          <li key={dataset.id}>
                            {dataset.name} ({dataset.records} records, {dataset.quality}% quality)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Performance */}
            {appState.modelResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-teal-600" />
                    Model Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Model Type</p>
                        <p className="text-lg font-medium">{appState.selectedModel || 'Not Selected'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm text-slate-600">Accuracy</p>
                          <p className="text-2xl font-bold text-blue-600">{appState.modelResults.accuracy}%</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                          <p className="text-sm text-slate-600">Precision</p>
                          <p className="text-2xl font-bold text-teal-600">{appState.modelResults.precision}%</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <p className="text-sm text-slate-600">Recall</p>
                          <p className="text-2xl font-bold text-amber-600">{appState.modelResults.recall}%</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <p className="text-sm text-slate-600">F1 Score</p>
                          <p className="text-2xl font-bold text-amber-600">{appState.modelResults.f1Score}%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsBarChart data={modelPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                          <XAxis dataKey="metric" stroke="#64748b" />
                          <YAxis stroke="#64748b" domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#FE9A00" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scenario Comparisons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} className="text-amber-600" />
                  Scenario Comparisons
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Visual summary of all selected scenarios and their predicted outcomes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Scenario Comparison Chart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={scenarioComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded shadow-lg border border-slate-200">
                                <p className="font-medium">{payload[0].payload.name}</p>
                                <p className="text-sm text-slate-600">
                                  Outcome: <span className="font-medium">{payload[0].payload.outcome}%</span>
                                </p>
                                <p className="text-sm text-slate-600">
                                  Change: <span className={`font-medium ${payload[0].payload.change >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change}%
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="outcome" fill="#FE9A00" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="change" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>

                  {/* Scenario Details Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario Name</TableHead>
                          <TableHead>Dataset</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Study Hours</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Outcome</TableHead>
                          <TableHead>Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedScenarios.map((scenario) => (
                          <TableRow key={scenario.id}>
                            <TableCell className="font-medium">{scenario.name}</TableCell>
                            <TableCell className="text-sm">{scenario.datasetName}</TableCell>
                            <TableCell className="text-sm">{scenario.modelUsed}</TableCell>
                            <TableCell>{scenario.parameters.studyHours}h/week</TableCell>
                            <TableCell>{scenario.parameters.attendanceRate}%</TableCell>
                            <TableCell>
                              <span className="font-medium text-blue-600">{scenario.outcome.toFixed(1)}%</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={scenario.outcomeChange >= 0 ? 'bg-amber-600' : 'bg-red-500'}>
                                {scenario.outcomeChange >= 0 ? '+' : ''}{scenario.outcomeChange.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Text Summary */}
                  <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Key Findings</h3>
                    <div className="space-y-3 text-sm text-slate-700">
                      <p>
                        <span className="font-medium">Best Performing Scenario:</span>{' '}
                        {selectedScenarios.length > 0 && 
                          selectedScenarios.reduce((max, s) => s.outcome > max.outcome ? s : max).name
                        } with a predicted outcome of{' '}
                        {selectedScenarios.length > 0 && 
                          selectedScenarios.reduce((max, s) => s.outcome > max.outcome ? s : max).outcome.toFixed(1)
                        }%
                      </p>
                      <p>
                        <span className="font-medium">Average Improvement:</span>{' '}
                        {selectedScenarios.length > 0 && 
                          (selectedScenarios.reduce((sum, s) => sum + s.outcomeChange, 0) / selectedScenarios.length).toFixed(1)
                        }% across all scenarios
                      </p>
                      <p>
                        <span className="font-medium">Recommended Action:</span>{' '}
                        Based on the analysis, implementing the best-performing scenario's parameters could significantly improve student outcomes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Scenarios Selected State */}
        {selectedScenarios.length === 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto mb-4 text-amber-600" size={48} />
                <h3 className="text-lg font-medium mb-2">No Scenarios Selected</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Please go back to the What-If Scenarios page and select scenarios to include in your report.
                </p>
                <Button onClick={() => onNavigate('scenarios')} className="bg-amber-600 hover:bg-amber-700">
                  Go to Scenarios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Reports</CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{generatedReports.length + (selectedScenarios.length > 0 ? 1 : 0)}</div>
              <p className="text-xs text-slate-500 mt-1">Available for download</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Generated This Month</CardTitle>
              <Calendar className="h-5 w-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">12</div>
              <p className="text-xs text-slate-500 mt-1">+3 from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Scenarios Analyzed</CardTitle>
              <Target className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{appState.scenarios.length}</div>
              <p className="text-xs text-slate-500 mt-1">{selectedScenarios.length} in current report</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Pages</CardTitle>
              <Presentation className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">247</div>
              <p className="text-xs text-slate-500 mt-1">Across all reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <p className="text-sm text-slate-500">Choose a template to generate a new report</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer hover:shadow-lg transition-all border-2 hover:border-${template.color}-400`}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 bg-${template.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className={`text-${template.color}-600`} size={24} />
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-slate-500">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generated Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Previously Generated Reports</CardTitle>
            <p className="text-sm text-slate-500">Access and download your report history</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.scenario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{report.pages}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-600 hover:bg-amber-700">
                        <CheckCircle2 size={12} className="mr-1" />
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye size={16} className="mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}