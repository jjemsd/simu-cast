import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import Sidebar from './Sidebar';
import { Upload, Trash2, Eye, Download, Sparkles, RefreshCw, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { AuthUser } from './auth/AuthHeader';

interface DatasetManagementProps {
  onNavigate: (page: string) => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

const initialDatasets = [
  { id: 1, name: 'Fall 2024 Student Performance', records: 1543, lastUpdated: '2024-10-05', status: 'Active', quality: 94, type: 'Real' },
  { id: 2, name: 'Spring 2024 Attendance Data', records: 1289, lastUpdated: '2024-09-28', status: 'Active', quality: 89, type: 'Real' },
  { id: 3, name: 'Synthetic Expansion - Fall 2024', records: 2500, lastUpdated: '2024-10-08', status: 'Active', quality: 92, type: 'Synthetic' },
  { id: 4, name: 'Historical Grade Distribution', records: 5621, lastUpdated: '2024-09-15', status: 'Cleaned', quality: 96, type: 'Real' },
  { id: 5, name: 'Intervention Program Results', records: 892, lastUpdated: '2024-10-01', status: 'Active', quality: 87, type: 'Real' },
];

export default function DatasetManagement({ onNavigate, user, onLoginClick, onSignUpClick, onLogout }: DatasetManagementProps) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isSyntheticOpen, setIsSyntheticOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaningOpen, setIsCleaningOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [syntheticConfig, setSyntheticConfig] = useState({
    name: '',
    numRecords: '500',
    distribution: 'normal',
    includeGrades: true,
    includeAttendance: true,
    includeDemographics: true,
    includeEngagement: true,
  });

  const handleDelete = (id: number) => {
    setDatasets(datasets.filter(d => d.id !== id));
    toast.success('Dataset deleted successfully');
  };

  const handleUpload = () => {
    if (uploadFileName) {
      const newDataset = {
        id: datasets.length + 1,
        name: uploadFileName,
        records: Math.floor(Math.random() * 2000) + 500,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Active' as const,
        quality: Math.floor(Math.random() * 15) + 80,
        type: 'Real' as const,
      };
      setDatasets([...datasets, newDataset]);
      setUploadFileName('');
      setIsUploadOpen(false);
      toast.success('Dataset uploaded successfully');
    }
  };

  const handleGenerateSynthetic = () => {
    if (!syntheticConfig.name) {
      toast.error('Please enter a dataset name');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const newDataset = {
        id: datasets.length + 1,
        name: syntheticConfig.name,
        records: parseInt(syntheticConfig.numRecords),
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Active' as const,
        quality: Math.floor(Math.random() * 8) + 88,
        type: 'Synthetic' as const,
      };
      
      setDatasets([...datasets, newDataset]);
      setIsGenerating(false);
      setIsSyntheticOpen(false);
      
      setSyntheticConfig({
        name: '',
        numRecords: '500',
        distribution: 'normal',
        includeGrades: true,
        includeAttendance: true,
        includeDemographics: true,
        includeEngagement: true,
      });
      
      toast.success(`Successfully generated ${syntheticConfig.numRecords} synthetic records!`);
    }, 2500);
  };

  const handleCleanData = () => {
    setIsCleaning(true);
    
    setTimeout(() => {
      toast.success('Data cleaning completed - missing values handled, outliers removed');
      setIsCleaning(false);
      setIsCleaningOpen(false);
    }, 2000);
  };

  const totalRecords = datasets.reduce((sum, d) => sum + d.records, 0);
  const avgQuality = Math.round(datasets.reduce((sum, d) => sum + d.quality, 0) / datasets.length);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage="datasets" onNavigate={onNavigate} user={user} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} onLogout={onLogout} />
      
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Data Input & Management</h1>
          <p className="text-slate-600">Upload, clean, preprocess, and expand your student datasets</p>
        </div>

        {/* Data Quality Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Datasets</CardTitle>
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{datasets.length}</div>
              <p className="text-xs text-slate-500 mt-1">{datasets.filter(d => d.type === 'Synthetic').length} synthetic</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Records</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{totalRecords.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Across all datasets</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Data Quality</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{avgQuality}%</div>
              <p className="text-xs text-slate-500 mt-1">Excellent standard</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Needs Cleaning</CardTitle>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{datasets.filter(d => d.quality < 90).length}</div>
              <p className="text-xs text-slate-500 mt-1">Below 90% quality</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload size={18} className="mr-2" />
                Upload Dataset (CSV/Excel)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Student Dataset</DialogTitle>
                <DialogDescription>
                  Import CSV or Excel files containing student-related data for analysis
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
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
                  <Label htmlFor="file-upload">Select File</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Click to browse or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">CSV, XLSX (Max 50MB)</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    Uploaded data will be automatically validated and preprocessed for quality assurance.
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpload} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Upload
                  </Button>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCleaningOpen} onOpenChange={setIsCleaningOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                <RefreshCw size={18} className="mr-2" />
                Clean & Preprocess Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Data Cleaning & Preprocessing</DialogTitle>
                <DialogDescription>
                  Automated detection and treatment of data quality issues
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Dataset to Clean</Label>
                  <Select defaultValue="dataset1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.filter(d => d.type === 'Real' && d.status === 'Active').map(dataset => (
                        <SelectItem key={dataset.id} value={`dataset${dataset.id}`}>
                          {dataset.name} ({dataset.quality}% quality)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium">Cleaning Operations</h4>

                  {/* Missing Values */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Missing Values Treatment</span>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                    <div className="ml-3 space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-2 mb-1">Standard Imputation</p>
                      <p className="text-xs text-slate-500">Mean / Median / Mode imputation, Remove rows</p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-2 mb-1">Time-Series Methods</p>
                      <p className="text-xs text-slate-500">Forward fill, Backward fill, Linear interpolation</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Outlier Removal</span>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Inconsistency Resolution</span>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Data Normalization</span>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleCleanData} 
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    disabled={isCleaning}
                  >
                    {isCleaning ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Cleaning...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} className="mr-2" />
                        Start Cleaning
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCleaningOpen(false)} className="flex-1" disabled={isCleaning}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSyntheticOpen} onOpenChange={setIsSyntheticOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-50">
                <Sparkles size={18} className="mr-2" />
                Generate Synthetic Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Data Generation & Expansion</DialogTitle>
                <DialogDescription>
                  Create statistically valid synthetic data to supplement limited datasets
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="synthetic-name">Dataset Name</Label>
                  <Input
                    id="synthetic-name"
                    placeholder="e.g., Synthetic Expansion - Fall 2024"
                    value={syntheticConfig.name}
                    onChange={(e) => setSyntheticConfig({ ...syntheticConfig, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="num-records">Number of Records</Label>
                    <Select 
                      value={syntheticConfig.numRecords}
                      onValueChange={(value) => setSyntheticConfig({ ...syntheticConfig, numRecords: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 records</SelectItem>
                        <SelectItem value="250">250 records</SelectItem>
                        <SelectItem value="500">500 records</SelectItem>
                        <SelectItem value="1000">1,000 records</SelectItem>
                        <SelectItem value="2500">2,500 records</SelectItem>
                        <SelectItem value="5000">5,000 records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distribution">Statistical Distribution</Label>
                    <Select 
                      value={syntheticConfig.distribution}
                      onValueChange={(value) => setSyntheticConfig({ ...syntheticConfig, distribution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal Distribution</SelectItem>
                        <SelectItem value="uniform">Uniform Distribution</SelectItem>
                        <SelectItem value="skewed">Skewed Distribution</SelectItem>
                        <SelectItem value="bimodal">Bimodal Distribution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Variables to Include</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="grades"
                        checked={syntheticConfig.includeGrades}
                        onCheckedChange={(checked) => 
                          setSyntheticConfig({ ...syntheticConfig, includeGrades: checked as boolean })
                        }
                      />
                      <label htmlFor="grades" className="text-sm cursor-pointer">
                        Grades & Test Scores
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="attendance"
                        checked={syntheticConfig.includeAttendance}
                        onCheckedChange={(checked) => 
                          setSyntheticConfig({ ...syntheticConfig, includeAttendance: checked as boolean })
                        }
                      />
                      <label htmlFor="attendance" className="text-sm cursor-pointer">
                        Attendance Records
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="demographics"
                        checked={syntheticConfig.includeDemographics}
                        onCheckedChange={(checked) => 
                          setSyntheticConfig({ ...syntheticConfig, includeDemographics: checked as boolean })
                        }
                      />
                      <label htmlFor="demographics" className="text-sm cursor-pointer">
                        Demographics
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="engagement"
                        checked={syntheticConfig.includeEngagement}
                        onCheckedChange={(checked) => 
                          setSyntheticConfig({ ...syntheticConfig, includeEngagement: checked as boolean })
                        }
                      />
                      <label htmlFor="engagement" className="text-sm cursor-pointer">
                        Engagement Metrics
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <strong>Data Synthesis Technique:</strong> Generated data uses statistical patterns from existing datasets 
                    to create artificial yet valid records, ensuring comprehensive analysis while maintaining data privacy.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleGenerateSynthetic} 
                    className="flex-1 bg-amber-500 hover:bg-amber-600"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Generate Dataset
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSyntheticOpen(false)} 
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Datasets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Repository</CardTitle>
            <p className="text-sm text-slate-500">Manage all student-related datasets and quality metrics</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-slate-400" />
                        <span>{dataset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={dataset.type === 'Synthetic' ? 'default' : 'outline'}
                        className={dataset.type === 'Synthetic' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                      >
                        {dataset.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{dataset.records.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={dataset.quality} className="w-16 h-2" />
                        <span className="text-sm">{dataset.quality}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{dataset.lastUpdated}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={dataset.status === 'Active' ? 'default' : 'secondary'}
                        className={dataset.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {dataset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download size={16} className="mr-1" />
                          Export
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(dataset.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
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
  );
}