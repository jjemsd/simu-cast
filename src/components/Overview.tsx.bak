import { useState } from 'react';
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { AppState, Dataset } from '../App';
import { AuthUser } from './auth/AuthHeader';
import DataQualityCard from './DataQualityCard';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';

interface OverviewProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

export default function Overview({ onNavigate, appState, updateAppState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: OverviewProps) {
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandWithSynthetic, setExpandWithSynthetic] = useState(false);
  const [syntheticRecords, setSyntheticRecords] = useState('500');
  const [isCleaningData, setIsCleaningData] = useState(false);
  const [cleaningOptions, setCleaningOptions] = useState({
    missingValues: false,
    outliers: false,
    duplicates: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeDatasetType, setActiveDatasetType] = useState<'Real' | 'Synthetic'>('Real');
  const [showSwitchDatasetModal, setShowSwitchDatasetModal] = useState(false);
  const [pendingDatasetSwitch, setPendingDatasetSwitch] = useState<'Real' | 'Synthetic' | null>(null);
  const [hasStartedCleaning, setHasStartedCleaning] = useState(false);
  const [isChangingDataset, setIsChangingDataset] = useState(false);
  
  // Expandable quality card state
  const [expandedCard, setExpandedCard] = useState<'missing' | 'outliers' | 'duplicates' | 'invalid' | 'text' | null>(null);

  // Detect if dataset has text columns (for conditional Text Cleaning section)
  const hasTextColumns = true; // In real app, this would be based on actual column types

  // Use the selected dataset (last uploaded one) or null if none exists
  const currentDataset = appState.selectedDataset
    ? appState.selectedDataset
    : appState.datasets.length > 0
    ? appState.datasets[appState.datasets.length - 1]
    : null;

  // Get Real and Synthetic datasets
  const realDataset = appState.datasets.find(d => d.type === 'Real');
  const syntheticDataset = appState.datasets.find(d => d.type === 'Synthetic');
  const activeDataset = activeDatasetType === 'Real' ? realDataset : syntheticDataset;

  const handleSyntheticRecordsChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue > 10000) {
        setSyntheticRecords('10000');
      } else if (numValue < 1) {
        setSyntheticRecords('1');
      } else {
        setSyntheticRecords(value);
      }
    } else if (value === '') {
      setSyntheticRecords('');
    }
  };

  const handleUpload = () => {
    if (!uploadFileName) {
      toast.error('Please enter a dataset name');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const records = Math.floor(Math.random() * 2000) + 500;
      const quality = Math.floor(Math.random() * 15) + 80;
      
      const newDataset: Dataset = {
        id: appState.datasets.length + 1,
        name: uploadFileName,
        records: records,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Active',
        quality: quality,
        type: 'Real',
      };

      const updatedDatasets = [...appState.datasets, newDataset];

      // If synthetic expansion is enabled, add synthetic dataset
      if (expandWithSynthetic) {
        const syntheticDataset: Dataset = {
          id: appState.datasets.length + 2,
          name: `Synthetic Expansion - ${uploadFileName}`,
          records: parseInt(syntheticRecords),
          lastUpdated: new Date().toISOString().split('T')[0],
          status: 'Active',
          quality: Math.floor(Math.random() * 8) + 88,
          type: 'Synthetic',
        };
        updatedDatasets.push(syntheticDataset);
        toast.success(`Dataset uploaded with ${syntheticRecords} synthetic records generated!`);
      } else {
        toast.success('Dataset uploaded successfully!');
      }

      updateAppState({
        datasets: updatedDatasets,
        selectedDataset: newDataset
      });

      setIsUploading(false);
      setUploadFileName('');
      setExpandWithSynthetic(false);
      setSyntheticRecords('500');
      setSelectedFile(null);
      setIsChangingDataset(false);
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        toast.error('Please select a valid CSV or XLSX file');
        return;
      }
      
      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleSelectDataset = (type: 'Real' | 'Synthetic') => {
    // If user has started cleaning or has cleaning options selected, show confirmation
    if (hasStartedCleaning || cleaningOptions.missingValues || cleaningOptions.outliers || cleaningOptions.duplicates) {
      setPendingDatasetSwitch(type);
      setShowSwitchDatasetModal(true);
    } else {
      setActiveDatasetType(type);
      toast.success(`Switched to ${type} dataset`);
    }
  };

  const confirmDatasetSwitch = () => {
    if (pendingDatasetSwitch) {
      setActiveDatasetType(pendingDatasetSwitch);
      setCleaningOptions({
        missingValues: false,
        outliers: false,
        duplicates: false
      });
      setHasStartedCleaning(false);
      toast.success(`Switched to ${pendingDatasetSwitch} dataset`);
      setPendingDatasetSwitch(null);
      setShowSwitchDatasetModal(false);
    }
  };

  const cancelDatasetSwitch = () => {
    setPendingDatasetSwitch(null);
    setShowSwitchDatasetModal(false);
  };

  // Generate sample preview data for a dataset
  const generatePreviewData = () => {
    const sampleData = [];
    const studentIds = ['STU001', 'STU002', 'STU003', 'STU004', 'STU005'];
    const performanceScores = [78.5, 65.2, 88.3, 71.0, 82.7];
    const studyHours = [20, 12, 25, 14, 18];
    const attendanceRates = [88, 72, 95, 68, 85];
    const tutorialSessions = [3, 1, 4, 2, 3];
    const assignmentCompletion = [85, 70, 95, 75, 88];
    const passFailStatus = ['Pass', 'Fail', 'Pass', 'Pass', 'Pass'];
    
    for (let i = 0; i < 5; i++) {
      sampleData.push({
        studentId: studentIds[i],
        performanceScore: performanceScores[i],
        studyHours: studyHours[i],
        attendanceRate: attendanceRates[i],
        tutorialSessions: tutorialSessions[i],
        assignmentCompletion: assignmentCompletion[i],
        passFailStatus: passFailStatus[i],
      });
    }
    
    return sampleData;
  };

  const previewData = generatePreviewData();

  const handleCleanData = () => {
    if (!currentDataset) return;
    
    // Check if at least one option is selected
    if (!cleaningOptions.missingValues && !cleaningOptions.outliers && !cleaningOptions.duplicates) {
      toast.error('Please select at least one cleaning option');
      return;
    }

    setIsCleaningData(true);
    
    setTimeout(() => {
      // Calculate quality improvement based on selected options
      let qualityImprovement = 0;
      
      if (cleaningOptions.missingValues) qualityImprovement += Math.floor(Math.random() * 5) + 3;
      if (cleaningOptions.outliers) qualityImprovement += Math.floor(Math.random() * 4) + 2;
      if (cleaningOptions.duplicates) qualityImprovement += Math.floor(Math.random() * 3) + 2;
      
      const updatedDatasets = appState.datasets.map(dataset => 
        dataset.id === currentDataset.id 
          ? { ...dataset, quality: Math.min(100, dataset.quality + qualityImprovement) }
          : dataset
      );
      
      updateAppState({ datasets: updatedDatasets });
      
      // Build success message based on what was cleaned
      const cleanedItems = [];
      if (cleaningOptions.missingValues) cleanedItems.push('missing values');
      if (cleaningOptions.outliers) cleanedItems.push('outliers');
      if (cleaningOptions.duplicates) cleanedItems.push('duplicates');
      
      toast.success(`Cleaned ${cleanedItems.join(', ')}! Quality improved by ${qualityImprovement}%.`);
      setIsCleaningData(false);
      
      // Reset cleaning options
      setCleaningOptions({
        missingValues: false,
        outliers: false,
        duplicates: false
      });
    }, 1500);
  };

  const handleProceedToModeling = () => {
    if (!currentDataset) {
      toast.error('Please upload a dataset first');
      return;
    }

    if (!appState.targetVariableLabel) {
      toast.error('Please select a target variable');
      return;
    }

    toast.success('Dataset confirmed! Proceeding to model building...');
    setTimeout(() => {
      onNavigate('modeling');
    }, 500);
  };

  const dataTypes = [
    { column: 'Student ID', type: 'Text', icon: '📝' },
    { column: 'Performance Score', type: 'Numeric', icon: '🔢' },
    { column: 'Study Hours', type: 'Numeric', icon: '🔢' },
    { column: 'Attendance Rate', type: 'Numeric', icon: '🔢' },
    { column: 'Tutorial Sessions', type: 'Numeric', icon: '🔢' },
    { column: 'Assignment Completion', type: 'Numeric', icon: '🔢' },
    { column: 'Pass/Fail Status', type: 'Categorical', icon: '🏷️' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="overview" 
        onNavigate={onNavigate} 
        appState={appState} 
        onWatchDemo={onWatchDemo}
        user={user}
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        onLogout={onLogout}
      />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={1} isGuest={user?.isGuest || false} onStepClick={(step) => {
          if (step === 1) onNavigate('overview');
        }} />
        
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Data Preparation</h1>
            <p className="text-slate-600">Upload, preview, clean, and configure your dataset for predictive modeling</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Upload Dataset */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">
                      1
                    </div>
                    <CardTitle>Upload Dataset</CardTitle>
                  </div>
                  {currentDataset && !isChangingDataset && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingDataset(true)}
                      className="border-amber-500 text-amber-700 hover:bg-amber-50"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Change Dataset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!currentDataset || isChangingDataset ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-name">Dataset Name</Label>
                      <Input
                        id="dataset-name"
                        placeholder="e.g., Fall 2024 Student Performance"
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Select File</Label>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer block ${
                          selectedFile 
                            ? 'border-amber-400 bg-amber-50' 
                            : 'border-slate-300 bg-slate-50 hover:border-amber-400'
                        }`}
                      >
                        {selectedFile ? (
                          <>
                            <CheckCircle2 className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                            <p className="text-sm font-medium text-amber-900">{selectedFile.name}</p>
                            <p className="text-xs text-amber-700 mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Click to select a different file</p>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">Click to browse or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">CSV, XLSX (Max 50MB)</p>
                          </>
                        )}
                      </label>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                          id="expand-synthetic"
                          checked={expandWithSynthetic}
                          onCheckedChange={(checked) => setExpandWithSynthetic(checked as boolean)}
                        />
                        <div className="flex-1">
                          <label htmlFor="expand-synthetic" className="text-sm font-medium cursor-pointer">
                            Expand with Synthetic Data Generation
                          </label>
                          <p className="text-xs text-slate-600 mt-1">
                            Generate additional synthetic records to enhance dataset size and improve model accuracy
                          </p>
                        </div>
                      </div>

                      {expandWithSynthetic && (
                        <div className="ml-6 space-y-3 mt-3 pt-3 border-t border-slate-200">
                          <div className="space-y-2">
                            <Label htmlFor="synthetic-count" className="text-sm">Number of Synthetic Records</Label>
                            <Input
                              id="synthetic-count"
                              type="number"
                              min="1"
                              max="10000"
                              value={syntheticRecords}
                              onChange={(e) => handleSyntheticRecordsChange(e.target.value)}
                              placeholder="Enter number of records"
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500">Enter a value between 1 and 10,000 records</p>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <p className="text-xs text-amber-900">
                              Synthetic data will be generated using statistical patterns from your uploaded dataset, 
                              maintaining data integrity while protecting student privacy.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleUpload}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Upload Dataset
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Success message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-900">Dataset uploaded successfully!</p>
                      </div>
                    </div>

                    {/* Available Datasets Section */}
                    <div>
                      <h3 className="font-medium mb-1">Available Datasets</h3>
                      <p className="text-sm text-slate-600 mb-4">Select which dataset to use for the next steps.</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Real Dataset Card */}
                        {realDataset && (
                          <div
                            onClick={() => handleSelectDataset('Real')}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              activeDatasetType === 'Real'
                                ? 'border-amber-500 bg-amber-50/50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            {/* Radio button and badge */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  activeDatasetType === 'Real' ? 'border-amber-500' : 'border-slate-300'
                                }`}>
                                  {activeDatasetType === 'Real' && (
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                  )}
                                </div>
                                <h4 className="font-medium">Real Dataset</h4>
                              </div>
                              {activeDatasetType === 'Real' && (
                                <Badge className="bg-amber-500 text-white">Active</Badge>
                              )}
                            </div>

                            {/* File name */}
                            <p className="text-sm text-slate-700 mb-3 truncate">{realDataset.name}</p>

                            {/* Stats */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Records:</span>
                                <span className="font-medium">{realDataset.records.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Quality:</span>
                                <span className="font-medium">{realDataset.quality}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Type:</span>
                                <span className="font-medium">{realDataset.type}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Synthetic Dataset Card */}
                        {syntheticDataset ? (
                          <div
                            onClick={() => handleSelectDataset('Synthetic')}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              activeDatasetType === 'Synthetic'
                                ? 'border-amber-500 bg-amber-50/50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            {/* Radio button and badge */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  activeDatasetType === 'Synthetic' ? 'border-amber-500' : 'border-slate-300'
                                }`}>
                                  {activeDatasetType === 'Synthetic' && (
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                  )}
                                </div>
                                <h4 className="font-medium">Synthetic Dataset</h4>
                              </div>
                              {activeDatasetType === 'Synthetic' && (
                                <Badge className="bg-amber-500 text-white">Active</Badge>
                              )}
                            </div>

                            {/* File name */}
                            <p className="text-sm text-slate-700 mb-3 truncate">{syntheticDataset.name}</p>

                            {/* Stats */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Records:</span>
                                <span className="font-medium">{syntheticDataset.records.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Quality:</span>
                                <span className="font-medium">{syntheticDataset.quality}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Type:</span>
                                <span className="font-medium">{syntheticDataset.type}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[180px]">
                            <Sparkles className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600 mb-3">Generate Synthetic Dataset</p>
                            <Button variant="outline" size="sm" disabled>
                              <Plus size={16} className="mr-1" />
                              Generate
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Active Dataset Indicator */}
                      <div className="bg-slate-100 border border-slate-200 rounded px-3 py-2">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Active Dataset:</span>{' '}
                          {activeDatasetType === 'Real' ? realDataset?.name : syntheticDataset?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Data Preview */}
            {currentDataset && (
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">
                      2
                    </div>
                    <CardTitle>Data Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Previewing Indicator */}
                    <div className="bg-slate-100 border border-slate-200 rounded px-3 py-2">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Previewing:</span>{' '}
                        {activeDataset?.name || currentDataset.name}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Sample Data (First 5 records)</h4>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student ID</TableHead>
                              <TableHead>Performance</TableHead>
                              <TableHead>Study Hrs</TableHead>
                              <TableHead>Attendance</TableHead>
                              <TableHead>Tutorials</TableHead>
                              <TableHead>Assignments</TableHead>
                              <TableHead>Pass/Fail</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono text-xs">{row.studentId}</TableCell>
                                <TableCell>{row.performanceScore}%</TableCell>
                                <TableCell>{row.studyHours}</TableCell>
                                <TableCell>{row.attendanceRate}%</TableCell>
                                <TableCell>{row.tutorialSessions}</TableCell>
                                <TableCell>{row.assignmentCompletion}%</TableCell>
                                <TableCell>
                                  <Badge variant={row.passFailStatus === 'Pass' ? 'default' : 'destructive'} className={row.passFailStatus === 'Pass' ? 'bg-green-600' : ''}>
                                    {row.passFailStatus}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Detected Data Types</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {dataTypes.map((dt, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2">
                            <span className="text-lg">{dt.icon}</span>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500">{dt.column}</p>
                              <p className="text-sm font-medium">{dt.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Data Quality & Cleaning */}
            {currentDataset && (
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">
                      3
                    </div>
                    <CardTitle>Data Quality & Cleaning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium mb-1">Quality Assessment</h4>
                        <p className="text-sm text-slate-600">
                          {currentDataset.quality >= 90 
                            ? 'Excellent data quality. Dataset is ready for modeling.'
                            : currentDataset.quality >= 75
                            ? 'Good data quality. Minor cleaning may improve results.'
                            : 'Data quality needs improvement. Cleaning recommended before modeling.'
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <DataQualityCard
                          type="missing"
                          percentage={Math.floor((100 - currentDataset.quality) / 3)}
                          disabled={isCleaningData}
                          isExpanded={expandedCard === 'missing'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'missing' ? null : 'missing')}
                        />

                        <DataQualityCard
                          type="outliers"
                          percentage={Math.floor((100 - currentDataset.quality) / 4)}
                          disabled={isCleaningData}
                          isExpanded={expandedCard === 'outliers'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'outliers' ? null : 'outliers')}
                        />

                        <DataQualityCard
                          type="duplicates"
                          percentage={Math.floor((100 - currentDataset.quality) / 5)}
                          disabled={isCleaningData}
                          isExpanded={expandedCard === 'duplicates'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'duplicates' ? null : 'duplicates')}
                        />

                        {hasTextColumns && (
                          <DataQualityCard
                            type="text"
                            percentage={Math.floor((100 - currentDataset.quality) / 6)}
                            disabled={isCleaningData}
                            isExpanded={expandedCard === 'text'}
                            onToggleExpand={() => setExpandedCard(expandedCard === 'text' ? null : 'text')}
                          />
                        )}

                        <DataQualityCard
                          type="invalid"
                          percentage={Math.floor((100 - currentDataset.quality) / 7)}
                          disabled={isCleaningData}
                          isExpanded={expandedCard === 'invalid'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'invalid' ? null : 'invalid')}
                        />
                      </div>

                      {currentDataset.quality < 95 && (
                        <Button
                          onClick={handleCleanData}
                          disabled={isCleaningData || (!cleaningOptions.missingValues && !cleaningOptions.outliers && !cleaningOptions.duplicates)}
                          className="w-full bg-amber-500 hover:bg-amber-600"
                        >
                          {isCleaningData ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Cleaning...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} className="mr-2" />
                              Apply Cleaning
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirm Dataset */}
            {currentDataset && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardHeader className="bg-amber-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">
                      4
                    </div>
                    <CardTitle>Confirm Dataset</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="target-variable" className="text-base font-medium mb-2 block">
                        Select Target Variable
                      </Label>
                      <p className="text-sm text-slate-600 mb-3">
                        Choose the variable you want to predict with your model
                      </p>
                      <Select 
                        value={appState.targetVariableLabel || ''} 
                        onValueChange={(value) => updateAppState({ targetVariableLabel: value })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select target variable..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Performance Score">Performance Score</SelectItem>
                          <SelectItem value="Pass/Fail Status">Pass/Fail Status</SelectItem>
                          <SelectItem value="Final Grade">Final Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {appState.targetVariableLabel && (
                      <div className="bg-white border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-medium">Prediction Task Type</h4>
                        </div>
                        <p className="text-sm text-slate-700">
                          {appState.targetVariableLabel === 'Pass/Fail Status' 
                            ? '📊 Classification - Predicting categorical outcomes (Pass/Fail)'
                            : '📈 Regression - Predicting continuous numerical values'
                          }
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleProceedToModeling}
                      disabled={!appState.targetVariableLabel}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-lg py-6"
                      size="lg"
                    >
                      Proceed to Build Model
                      <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Switch Dataset Confirmation Modal */}
      <Dialog open={showSwitchDatasetModal} onOpenChange={setShowSwitchDatasetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Dataset?</DialogTitle>
            <DialogDescription>
              Switching datasets will reset cleaning selections and model results.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              You are about to switch from <strong>{activeDatasetType} Dataset</strong> to <strong>{pendingDatasetSwitch} Dataset</strong>.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Any cleaning options you've selected will be cleared.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelDatasetSwitch}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDatasetSwitch}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}