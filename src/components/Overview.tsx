import { useState } from 'react';
import {
  Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle,
  ArrowRight, Sparkles, RefreshCw, Plus,
} from 'lucide-react';
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
import { AppState, Dataset, ColumnInfo } from '../App';
import { AuthUser } from './auth/AuthHeader';
import DataQualityCard from './DataQualityCard';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';

const API_BASE = 'http://localhost:8000';

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

function colIcon(type: ColumnInfo['type']): string {
  switch (type) {
    case 'Numeric': return '🔢';
    case 'Date': return '📅';
    case 'Categorical': return '🏷️';
    default: return '📝';
  }
}

function inferTaskType(col: ColumnInfo): 'classification' | 'regression' {
  return col.type === 'Categorical' || col.type === 'Text' ? 'classification' : 'regression';
}

export default function Overview({
  onNavigate, appState, updateAppState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout,
}: OverviewProps) {
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandWithSynthetic, setExpandWithSynthetic] = useState(false);
  const [syntheticRecords, setSyntheticRecords] = useState('500');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeDatasetType, setActiveDatasetType] = useState<'Real' | 'Synthetic'>('Real');
  const [showSwitchDatasetModal, setShowSwitchDatasetModal] = useState(false);
  const [pendingDatasetSwitch, setPendingDatasetSwitch] = useState<'Real' | 'Synthetic' | null>(null);
  const [isChangingDataset, setIsChangingDataset] = useState(false);
  const [expandedCard, setExpandedCard] = useState<'missing' | 'outliers' | 'duplicates' | 'invalid' | 'text' | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);

  const realDataset = appState.datasets.find(d => d.type === 'Real');
  const syntheticDataset = appState.datasets.find(d => d.type === 'Synthetic');
  const activeDataset = activeDatasetType === 'Real' ? realDataset : syntheticDataset;

  const currentDataset = appState.selectedDataset
    ?? (appState.datasets.length > 0 ? appState.datasets[appState.datasets.length - 1] : null);

  const targetCandidates: ColumnInfo[] = activeDataset?.columnTypes ?? [];
  const selectedTargetCol = targetCandidates.find(c => c.column === appState.targetVariableLabel);
  const detectedTaskType = selectedTargetCol ? inferTaskType(selectedTargetCol) : null;

  const hasTextIssues = (activeDataset?.qualityReport?.text_issues?.count ?? 0) > 0;

  const handleSyntheticRecordsChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setSyntheticRecords(String(Math.min(10000, Math.max(1, num))));
    } else if (value === '') {
      setSyntheticRecords('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      toast.error('Please select a valid CSV or XLSX file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50 MB limit');
      return;
    }
    setSelectedFile(file);
    toast.success('File selected: ' + file.name);
  };

  const handleUpload = async () => {
    if (!uploadFileName.trim()) { toast.error('Please enter a dataset name'); return; }
    if (!selectedFile) { toast.error('Please select a file'); return; }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('name', uploadFileName.trim());
      form.append('generate_synthetic_data', String(expandWithSynthetic));
      form.append('synthetic_records', syntheticRecords || '500');

      const uploadRes = await fetch(API_BASE + '/api/datasets/upload', { method: 'POST', body: form });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Upload failed (' + uploadRes.status + ')');
      }
      const uploadData = await uploadRes.json();

      const previewRes = await fetch(API_BASE + '/api/datasets/' + uploadData.datasetId + '/preview');
      if (!previewRes.ok) throw new Error('Preview fetch failed');
      const preview = await previewRes.json();

      const newDataset: Dataset = {
        id: Date.now(),
        datasetId: uploadData.datasetId,
        name: uploadData.name,
        records: uploadData.records,
        columns: uploadData.columns,
        quality: uploadData.quality,
        qualityReport: uploadData.qualityReport ?? null,
        columnTypes: preview.columnTypes ?? [],
        previewRows: preview.previewRows ?? [],
        lastUpdated: uploadData.lastUpdated ?? new Date().toISOString().split('T')[0],
        status: 'Active',
        type: 'Real',
      };

      const updatedDatasets: Dataset[] = [
        ...appState.datasets.filter(d => d.type !== 'Real'),
        newDataset,
      ];

      if (uploadData.synthetic) {
        const s = uploadData.synthetic;
        const synthPreviewRes = await fetch(API_BASE + '/api/datasets/' + s.datasetId + '/preview');
        const synthPreview = synthPreviewRes.ok ? await synthPreviewRes.json() : { columnTypes: [], previewRows: [] };

        updatedDatasets.push({
          id: Date.now() + 1,
          datasetId: s.datasetId,
          name: s.name,
          records: s.records,
          columns: s.columns ?? uploadData.columns,
          quality: s.quality,
          qualityReport: null,
          columnTypes: synthPreview.columnTypes ?? [],
          previewRows: synthPreview.previewRows ?? [],
          lastUpdated: s.lastUpdated ?? new Date().toISOString().split('T')[0],
          status: 'Active',
          type: 'Synthetic',
        });
        toast.success('Dataset uploaded with ' + s.records + ' synthetic records generated!');
      } else {
        toast.success('Dataset uploaded successfully!');
      }

      updateAppState({ datasets: updatedDatasets, selectedDataset: newDataset, targetVariableLabel: undefined });
      setUploadFileName('');
      setExpandWithSynthetic(false);
      setSyntheticRecords('500');
      setSelectedFile(null);
      setIsChangingDataset(false);
      setActiveDatasetType('Real');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDataset = (type: 'Real' | 'Synthetic') => {
    if (type === activeDatasetType) return;
    setPendingDatasetSwitch(type);
    setShowSwitchDatasetModal(true);
  };

  const confirmDatasetSwitch = () => {
    if (pendingDatasetSwitch) {
      setActiveDatasetType(pendingDatasetSwitch);
      setExpandedCard(null);
      toast.success('Switched to ' + pendingDatasetSwitch + ' dataset');
    }
    setPendingDatasetSwitch(null);
    setShowSwitchDatasetModal(false);
  };

  const cancelDatasetSwitch = () => {
    setPendingDatasetSwitch(null);
    setShowSwitchDatasetModal(false);
  };

  const handleApplyFix = async (options: Record<string, string | boolean>) => {
    if (!activeDataset) { toast.error('No active dataset'); return; }
    setIsApplyingFix(true);
    try {
      const res = await fetch(API_BASE + '/api/datasets/' + activeDataset.datasetId + '/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Cleaning failed (' + res.status + ')');
      }
      const data = await res.json();

      // Refresh preview after cleaning
      const previewRes = await fetch(API_BASE + '/api/datasets/' + activeDataset.datasetId + '/preview');
      const preview = previewRes.ok ? await previewRes.json() : { columnTypes: activeDataset.columnTypes, previewRows: activeDataset.previewRows };

      const updatedDataset: Dataset = {
        ...activeDataset,
        records: data.records ?? activeDataset.records,
        quality: data.quality ?? activeDataset.quality,
        qualityReport: data.qualityReport ?? activeDataset.qualityReport,
        columnTypes: preview.columnTypes ?? activeDataset.columnTypes,
        previewRows: preview.previewRows ?? activeDataset.previewRows,
      };

      const updatedDatasets = appState.datasets.map(d =>
        d.datasetId === activeDataset.datasetId ? updatedDataset : d
      );
      updateAppState({ datasets: updatedDatasets, selectedDataset: updatedDataset });
      toast.success('Fix applied successfully!');
      setExpandedCard(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cleaning failed');
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleProceedToModeling = () => {
    if (!currentDataset) { toast.error('Please upload a dataset first'); return; }
    if (!appState.targetVariableLabel) { toast.error('Please select a target variable'); return; }
    updateAppState({ targetVariable: detectedTaskType ?? 'regression' });
    toast.success('Dataset confirmed! Proceeding to model building...');
    setTimeout(() => onNavigate('modeling'), 500);
  };

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

            {/* Step 1: Upload */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">1</div>
                    <CardTitle>Upload Dataset</CardTitle>
                  </div>
                  {currentDataset && !isChangingDataset && (
                    <Button variant="outline" size="sm" onClick={() => setIsChangingDataset(true)} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                      <RefreshCw size={16} className="mr-2" />Change Dataset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!currentDataset || isChangingDataset ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-name">Dataset Name</Label>
                      <Input id="dataset-name" placeholder="e.g., Sales Q1 2025" value={uploadFileName} onChange={(e) => setUploadFileName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Select File</Label>
                      <input type="file" id="file-upload" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
                      <label htmlFor="file-upload" className={'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer block ' + (selectedFile ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-slate-50 hover:border-amber-400')}>
                        {selectedFile ? (
                          <>
                            <CheckCircle2 className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                            <p className="text-sm font-medium text-amber-900">{selectedFile.name}</p>
                            <p className="text-xs text-amber-700 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <p className="text-xs text-slate-500 mt-2">Click to select a different file</p>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">Click to browse or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">CSV, XLSX (Max 50 MB)</p>
                          </>
                        )}
                      </label>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox id="expand-synthetic" checked={expandWithSynthetic} onCheckedChange={(c) => setExpandWithSynthetic(c as boolean)} />
                        <div className="flex-1">
                          <label htmlFor="expand-synthetic" className="text-sm font-medium cursor-pointer">Expand with Synthetic Data Generation</label>
                          <p className="text-xs text-slate-600 mt-1">Generate additional records that mirror your dataset</p>
                        </div>
                      </div>
                      {expandWithSynthetic && (
                        <div className="ml-6 space-y-3 mt-3 pt-3 border-t border-slate-200">
                          <div className="space-y-2">
                            <Label htmlFor="synthetic-count" className="text-sm">Number of Synthetic Records</Label>
                            <Input id="synthetic-count" type="number" min="1" max="10000" value={syntheticRecords} onChange={(e) => handleSyntheticRecordsChange(e.target.value)} placeholder="Enter number of records" />
                            <p className="text-xs text-slate-500">Between 1 and 10,000 records</p>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <p className="text-xs text-amber-900">Synthetic records are generated from the statistical distribution of your uploaded data.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleUpload} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600" disabled={isUploading}>
                      {isUploading ? <><Loader2 size={18} className="mr-2 animate-spin" />Uploading...</> : <><Upload size={18} className="mr-2" />Upload Dataset</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-900">Dataset uploaded successfully!</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">Available Datasets</h3>
                      <p className="text-sm text-slate-600 mb-4">Select which dataset to use for the next steps.</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {realDataset && (
                          <div onClick={() => handleSelectDataset('Real')} className={'relative border-2 rounded-lg p-4 cursor-pointer transition-all ' + (activeDatasetType === 'Real' ? 'border-amber-500 bg-amber-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm')}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={'w-4 h-4 rounded-full border-2 flex items-center justify-center ' + (activeDatasetType === 'Real' ? 'border-amber-500' : 'border-slate-300')}>
                                  {activeDatasetType === 'Real' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                </div>
                                <h4 className="font-medium">Real Dataset</h4>
                              </div>
                              {activeDatasetType === 'Real' && <Badge className="bg-amber-500 text-white">Active</Badge>}
                            </div>
                            <p className="text-sm text-slate-700 mb-3 truncate">{realDataset.name}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Records:</span><span className="font-medium">{realDataset.records.toLocaleString()}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Columns:</span><span className="font-medium">{realDataset.columns}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Quality:</span><span className="font-medium">{realDataset.quality}%</span></div>
                            </div>
                          </div>
                        )}

                        {syntheticDataset ? (
                          <div onClick={() => handleSelectDataset('Synthetic')} className={'relative border-2 rounded-lg p-4 cursor-pointer transition-all ' + (activeDatasetType === 'Synthetic' ? 'border-amber-500 bg-amber-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm')}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={'w-4 h-4 rounded-full border-2 flex items-center justify-center ' + (activeDatasetType === 'Synthetic' ? 'border-amber-500' : 'border-slate-300')}>
                                  {activeDatasetType === 'Synthetic' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                </div>
                                <h4 className="font-medium">Synthetic Dataset</h4>
                              </div>
                              {activeDatasetType === 'Synthetic' && <Badge className="bg-amber-500 text-white">Active</Badge>}
                            </div>
                            <p className="text-sm text-slate-700 mb-3 truncate">{syntheticDataset.name}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Records:</span><span className="font-medium">{syntheticDataset.records.toLocaleString()}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Columns:</span><span className="font-medium">{syntheticDataset.columns}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Quality:</span><span className="font-medium">{syntheticDataset.quality}%</span></div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[180px]">
                            <Sparkles className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600 mb-3">No synthetic dataset yet</p>
                            <Button variant="outline" size="sm" disabled><Plus size={16} className="mr-1" />Generate</Button>
                          </div>
                        )}
                      </div>

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
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">2</div>
                    <CardTitle>Data Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-slate-100 border border-slate-200 rounded px-3 py-2">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Previewing:</span>{' '}
                        {activeDataset?.name ?? currentDataset.name}
                        {activeDataset && (
                          <span className="text-slate-500 ml-2">({activeDataset.records.toLocaleString()} records, {activeDataset.columns} columns)</span>
                        )}
                      </p>
                    </div>

                    {activeDataset && activeDataset.previewRows.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-3">Sample Data (First {activeDataset.previewRows.length} records)</h4>
                        <div className="border border-slate-200 rounded-lg overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {activeDataset.columnTypes.map(col => (
                                  <TableHead key={col.column} className="whitespace-nowrap">{col.column}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activeDataset.previewRows.map((row, idx) => (
                                <TableRow key={idx}>
                                  {activeDataset.columnTypes.map(col => (
                                    <TableCell key={col.column} className="whitespace-nowrap text-sm">
                                      {row[col.column] === null || row[col.column] === undefined
                                        ? <span className="text-slate-400 italic">null</span>
                                        : String(row[col.column])}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No preview data available.</p>
                    )}

                    {activeDataset && activeDataset.columnTypes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Detected Column Types</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activeDataset.columnTypes.map(col => (
                            <div key={col.column} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2">
                              <span className="text-lg">{colIcon(col.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 truncate">{col.column}</p>
                                <p className="text-sm font-medium">{col.type}</p>
                              </div>
                              {col.missingCount > 0 && (
                                <span className="text-xs text-amber-600 shrink-0">{col.missingCount} missing</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Data Quality and Cleaning */}
            {currentDataset && (
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">3</div>
                    <CardTitle>Data Quality and Cleaning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium mb-1">Quality Assessment</h4>
                        <p className="text-sm text-slate-600">
                          {(activeDataset?.quality ?? 0) >= 90
                            ? 'Excellent data quality. Dataset is ready for modeling.'
                            : (activeDataset?.quality ?? 0) >= 75
                            ? 'Good data quality. Minor cleaning may improve results.'
                            : 'Data quality needs improvement. Cleaning recommended before modeling.'}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <DataQualityCard
                          type="missing"
                          percentage={activeDataset?.qualityReport?.missing_values?.percentage ?? 0}
                          count={activeDataset?.qualityReport?.missing_values?.count ?? 0}
                          affectedColumns={activeDataset?.qualityReport?.missing_values?.columns ?? []}
                          disabled={isApplyingFix}
                          isExpanded={expandedCard === 'missing'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'missing' ? null : 'missing')}
                          onApply={handleApplyFix}
                        />
                        <DataQualityCard
                          type="outliers"
                          percentage={activeDataset?.qualityReport?.outliers?.percentage ?? 0}
                          count={activeDataset?.qualityReport?.outliers?.count ?? 0}
                          affectedColumns={activeDataset?.qualityReport?.outliers?.columns ?? []}
                          disabled={isApplyingFix}
                          isExpanded={expandedCard === 'outliers'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'outliers' ? null : 'outliers')}
                          onApply={handleApplyFix}
                        />
                        <DataQualityCard
                          type="duplicates"
                          percentage={activeDataset?.qualityReport?.duplicates?.percentage ?? 0}
                          count={activeDataset?.qualityReport?.duplicates?.count ?? 0}
                          affectedColumns={activeDataset?.qualityReport?.duplicates?.columns ?? []}
                          disabled={isApplyingFix}
                          isExpanded={expandedCard === 'duplicates'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'duplicates' ? null : 'duplicates')}
                          onApply={handleApplyFix}
                        />
                        {hasTextIssues && (
                          <DataQualityCard
                            type="text"
                            percentage={activeDataset?.qualityReport?.text_issues?.percentage ?? 0}
                            count={activeDataset?.qualityReport?.text_issues?.count ?? 0}
                            affectedColumns={activeDataset?.qualityReport?.text_issues?.columns ?? []}
                            disabled={isApplyingFix}
                            isExpanded={expandedCard === 'text'}
                            onToggleExpand={() => setExpandedCard(expandedCard === 'text' ? null : 'text')}
                            onApply={handleApplyFix}
                          />
                        )}
                        <DataQualityCard
                          type="invalid"
                          percentage={activeDataset?.qualityReport?.invalid?.percentage ?? 0}
                          count={activeDataset?.qualityReport?.invalid?.count ?? 0}
                          affectedColumns={activeDataset?.qualityReport?.invalid?.columns ?? []}
                          disabled={isApplyingFix}
                          isExpanded={expandedCard === 'invalid'}
                          onToggleExpand={() => setExpandedCard(expandedCard === 'invalid' ? null : 'invalid')}
                          onApply={handleApplyFix}
                        />
                      </div>
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
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-md">4</div>
                    <CardTitle>Confirm Dataset</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="target-variable" className="text-base font-medium mb-2 block">Select Target Variable</Label>
                      <p className="text-sm text-slate-600 mb-3">Choose the column you want the model to predict</p>
                      <Select value={appState.targetVariableLabel ?? ''} onValueChange={(value) => updateAppState({ targetVariableLabel: value })}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select target variable..." />
                        </SelectTrigger>
                        <SelectContent>
                          {targetCandidates.map(col => (
                            <SelectItem key={col.column} value={col.column}>
                              {col.column} ({col.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {appState.targetVariableLabel && detectedTaskType && (
                      <div className="bg-white border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-medium">Prediction Task Type</h4>
                        </div>
                        <p className="text-sm text-slate-700">
                          {detectedTaskType === 'classification'
                            ? 'Classification - Predicting categorical outcomes'
                            : 'Regression - Predicting continuous numerical values'}
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

      <Dialog open={showSwitchDatasetModal} onOpenChange={setShowSwitchDatasetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Dataset?</DialogTitle>
            <DialogDescription>Switching datasets will reset your cleaning and target variable selection.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Switching from <strong>{activeDatasetType} Dataset</strong> to <strong>{pendingDatasetSwitch} Dataset</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelDatasetSwitch}>Cancel</Button>
            <Button onClick={confirmDatasetSwitch} className="bg-amber-500 hover:bg-amber-600">Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
