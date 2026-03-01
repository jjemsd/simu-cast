import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Sidebar from './Sidebar';
import { FileText, Calendar, Download, Eye, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AuthUser } from './auth/AuthHeader';
import { toast } from 'sonner';

interface HistoryProps {
  onNavigate: (page: string) => void;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

interface ReportRecord {
  id: number;
  timestamp: string;
  name: string;
  description: string;
  fileSize: string;
  pages: number;
}

const mockReports: ReportRecord[] = [
  {
    id: 1,
    timestamp: '2025-02-14 14:45',
    name: 'Comprehensive Analysis Report',
    description: 'Student performance prediction analysis with Random Forest model',
    fileSize: '2.4 MB',
    pages: 12,
  },
  {
    id: 2,
    timestamp: '2025-02-13 16:30',
    name: 'Scenario Comparison Report',
    description: 'What-if analysis comparing 5 intervention scenarios',
    fileSize: '1.8 MB',
    pages: 8,
  },
  {
    id: 3,
    timestamp: '2025-02-12 11:15',
    name: 'Model Performance Report',
    description: 'Detailed metrics for Neural Network and Gradient Boosting models',
    fileSize: '3.1 MB',
    pages: 15,
  },
  {
    id: 4,
    timestamp: '2025-02-11 09:20',
    name: 'Quarterly Analysis Report',
    description: 'Q1 2025 student cohort performance trends and insights',
    fileSize: '4.2 MB',
    pages: 18,
  },
  {
    id: 5,
    timestamp: '2025-02-10 14:00',
    name: 'Intervention Impact Report',
    description: 'Analysis of study hours and attendance interventions',
    fileSize: '2.0 MB',
    pages: 10,
  },
];

export default function History({ onNavigate, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports
  const filteredReports = mockReports.filter(report => 
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadReport = (report: ReportRecord) => {
    toast.success(`Downloading: ${report.name}`);
  };

  const handleViewReport = (report: ReportRecord) => {
    toast.info(`Opening: ${report.name}`);
  };

  const handleDeleteReport = (report: ReportRecord) => {
    toast.success(`Deleted: ${report.name}`);
  };

  // Group by date
  const groupedReports = filteredReports.reduce((groups, item) => {
    const date = item.timestamp.split(' ')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, ReportRecord[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="history" 
        onNavigate={onNavigate} 
        onWatchDemo={onWatchDemo}
        user={user}
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        onLogout={onLogout}
      />
      
      <div className="ml-64 flex-1">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl">Report History</h1>
                <p className="text-slate-600">Access and manage your generated PDF reports</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Reports Generated</p>
                  <p className="text-3xl font-semibold">{mockReports.length}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {mockReports.reduce((sum, r) => sum + r.pages, 0)} total pages
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
                  <FileText className="text-amber-600" size={32} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedReports).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No reports found matching your search</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedReports).map(([date, reports]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar size={18} className="text-slate-400" />
                        <h3 className="font-medium text-slate-700">{formatDate(date)}</h3>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>

                      {/* Reports for this date */}
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all"
                          >
                            {/* PDF Icon */}
                            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="text-red-600" size={24} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 mb-1">{report.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{report.description}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>📄 {report.pages} pages</span>
                                <span>💾 {report.fileSize}</span>
                                <span>🕐 {report.timestamp.split(' ')[1]}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReport(report)}
                                className="h-9"
                              >
                                <Eye size={16} className="mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadReport(report)}
                                className="h-9 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                              >
                                <Download size={16} className="mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReport(report)}
                                className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}