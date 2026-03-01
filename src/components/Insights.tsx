import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Sidebar from './Sidebar';
import ProgressIndicator from './ProgressIndicator';
import { AlertTriangle, TrendingUp, Users, Target, CheckCircle2, BookOpen, Clock, Award, FileDown, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { AppState } from '../App';
import { AuthUser } from './auth/AuthHeader';

interface InsightsProps {
  onNavigate: (page: string) => void;
  appState: AppState;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

const insights = [
  {
    icon: TrendingUp,
    title: 'Strong Correlation: Attendance & Performance',
    category: 'Key Finding',
    description: 'Students with attendance rates above 85% demonstrate 28% higher final grades compared to those below 70% attendance. This represents the strongest predictor in our models.',
    impact: 'High',
    color: 'blue',
  },
  {
    icon: AlertTriangle,
    title: 'High-Risk Student Cohort Identified',
    category: 'Risk Alert',
    description: '14 students currently exhibit multiple risk factors: low attendance (<60%), incomplete assignments (>30% missing), and declining test scores. Immediate intervention recommended.',
    impact: 'Critical',
    color: 'red',
  },
  {
    icon: Users,
    title: 'Tutorial Session Impact Analysis',
    category: 'Key Finding',
    description: 'Students participating in 3+ tutorial sessions per month show 15% improvement in problem-solving scores. Current participation rate is only 42%.',
    impact: 'Medium',
    color: 'teal',
  },
  {
    icon: Target,
    title: 'Implement Early Warning System',
    category: 'Suggested Intervention',
    description: 'Deploy automated alerts for students who miss 2+ consecutive classes or score below 60% on two consecutive assessments. Early detection can improve recovery rates by 35%.',
    impact: 'High',
    color: 'purple',
  },
  {
    icon: BookOpen,
    title: 'Study Hours Threshold Effect',
    category: 'Key Finding',
    description: 'Diminishing returns observed beyond 25 hours of study per week. Optimal range is 15-25 hours with focus on quality over quantity. Work-life balance matters.',
    impact: 'Medium',
    color: 'teal',
  },
  {
    icon: CheckCircle2,
    title: 'Peer Study Groups Show Promise',
    category: 'Suggested Intervention',
    description: 'Students in structured peer study groups (4-6 members) demonstrate 12% better retention and collaboration skills. Recommend formalizing peer study program.',
    impact: 'Medium',
    color: 'green',
  },
  {
    icon: Clock,
    title: 'Assignment Deadline Extension Benefits',
    category: 'Key Finding',
    description: 'Flexible deadlines (48-hour extension window) reduced stress-related performance drops by 18% without compromising submission quality.',
    impact: 'Low',
    color: 'amber',
  },
  {
    icon: Award,
    title: 'Gamification Elements Boost Engagement',
    category: 'Suggested Intervention',
    description: 'Pilot program using achievement badges and progress tracking increased assignment completion rates by 22%. Consider platform-wide implementation.',
    impact: 'Medium',
    color: 'indigo',
  },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'Critical':
      return 'bg-red-500 hover:bg-red-600';
    case 'High':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'Medium':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'Low':
      return 'bg-slate-500 hover:bg-slate-600';
    default:
      return 'bg-slate-500';
  }
};

const getCardBorderColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500',
    red: 'border-l-red-500',
    teal: 'border-l-teal-500',
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
    indigo: 'border-l-indigo-500',
  };
  return colors[color] || 'border-l-slate-500';
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-50',
    red: 'text-red-500 bg-red-50',
    teal: 'text-teal-500 bg-teal-50',
    purple: 'text-purple-500 bg-purple-50',
    amber: 'text-amber-500 bg-amber-50',
    indigo: 'text-indigo-500 bg-indigo-50',
  };
  return colors[color] || 'text-slate-500 bg-slate-50';
};

export default function Insights({ onNavigate, appState, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: InsightsProps) {
  const currentScenario = appState.currentScenario;
  
  // Generate scenario-specific insights based on parameters
  const generateScenarioInsights = (scenario: any) => {
    const scenarioSpecificInsights = [];
    const params = scenario.parameters;
    const outcomeChange = scenario.outcomeChange;
    
    // Study Hours Insights
    if (params.studyHours > 20) {
      scenarioSpecificInsights.push({
        icon: TrendingUp,
        title: 'High Study Hours Impact',
        category: 'Scenario Finding',
        description: `With ${params.studyHours} hours of study per week, students show strong performance gains. This scenario predicts a ${outcomeChange >= 0 ? '+' : ''}${outcomeChange.toFixed(1)}% change in outcomes.`,
        impact: outcomeChange > 5 ? 'High' : 'Medium',
        color: outcomeChange > 5 ? 'green' : 'blue',
      });
    } else if (params.studyHours < 10) {
      scenarioSpecificInsights.push({
        icon: AlertTriangle,
        title: 'Low Study Hours Warning',
        category: 'Risk Alert',
        description: `Only ${params.studyHours} hours of study per week may be insufficient. Consider interventions to increase student engagement and study time.`,
        impact: 'High',
        color: 'red',
      });
    }
    
    // Attendance Insights
    if (params.attendanceRate >= 90) {
      scenarioSpecificInsights.push({
        icon: CheckCircle2,
        title: 'Excellent Attendance Rate',
        category: 'Scenario Finding',
        description: `${params.attendanceRate}% attendance rate strongly correlates with improved outcomes. Maintaining this level should be a priority.`,
        impact: 'High',
        color: 'green',
      });
    } else if (params.attendanceRate < 70) {
      scenarioSpecificInsights.push({
        icon: AlertTriangle,
        title: 'Attendance Concerns',
        category: 'Risk Alert',
        description: `${params.attendanceRate}% attendance rate is concerning. Students with low attendance typically struggle. Immediate intervention needed.`,
        impact: 'Critical',
        color: 'red',
      });
    }
    
    // Tutorial Sessions Insights
    if (params.tutorialSessions >= 4) {
      scenarioSpecificInsights.push({
        icon: Users,
        title: 'Tutorial Sessions Effectiveness',
        category: 'Scenario Finding',
        description: `${params.tutorialSessions} tutorial sessions per month provides strong support. This intervention shows measurable performance improvements.`,
        impact: 'Medium',
        color: 'teal',
      });
    } else if (params.tutorialSessions === 0) {
      scenarioSpecificInsights.push({
        icon: Target,
        title: 'No Tutorial Support',
        category: 'Suggested Intervention',
        description: 'Students in this scenario receive no tutorial support. Adding even 2-3 sessions per month could significantly improve outcomes.',
        impact: 'Medium',
        color: 'purple',
      });
    }
    
    // Assignment Completion Insights
    if (params.assignmentCompletion >= 95) {
      scenarioSpecificInsights.push({
        icon: Award,
        title: 'Outstanding Assignment Completion',
        category: 'Scenario Finding',
        description: `${params.assignmentCompletion}% assignment completion rate is exceptional. Students in this scenario demonstrate strong academic discipline.`,
        impact: 'Medium',
        color: 'green',
      });
    } else if (params.assignmentCompletion < 70) {
      scenarioSpecificInsights.push({
        icon: AlertTriangle,
        title: 'Low Assignment Completion',
        category: 'Risk Alert',
        description: `Only ${params.assignmentCompletion}% assignment completion may indicate disengagement or difficulty with coursework. Targeted support recommended.`,
        impact: 'High',
        color: 'red',
      });
    }
    
    // Overall Outcome Analysis
    if (outcomeChange > 5) {
      scenarioSpecificInsights.push({
        icon: TrendingUp,
        title: 'Strong Positive Impact Predicted',
        category: 'Scenario Finding',
        description: `This scenario shows a significant ${outcomeChange.toFixed(1)}% improvement over baseline. The combination of interventions is highly effective.`,
        impact: 'High',
        color: 'green',
      });
    } else if (outcomeChange < -2) {
      scenarioSpecificInsights.push({
        icon: AlertTriangle,
        title: 'Negative Outcome Predicted',
        category: 'Risk Alert',
        description: `This scenario predicts a ${outcomeChange.toFixed(1)}% decline in performance. Parameter adjustments recommended before implementation.`,
        impact: 'Critical',
        color: 'red',
      });
    }
    
    return scenarioSpecificInsights;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage="insights" onNavigate={onNavigate} appState={appState} onWatchDemo={onWatchDemo} user={user} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} onLogout={onLogout} />
      
      <div className="ml-64 flex-1">
        <ProgressIndicator currentStep={4} />
        
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Insights & Recommendations</h1>
            {currentScenario ? (
              <p className="text-slate-600">Scenario-specific insights for: <span className="font-medium text-blue-600">{currentScenario.name}</span></p>
            ) : (
              <p className="text-slate-600">Data-driven findings and actionable interventions for student success</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => onNavigate('scenarios')}
            >
              <ArrowRight size={18} className="mr-2" />
              Back to Scenarios
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileDown size={18} className="mr-2" />
              Export as PDF
            </Button>
          </div>
        </div>

        {/* Scenario Summary Card */}
        {currentScenario && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
            <CardHeader>
              <CardTitle>Scenario Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Dataset</p>
                  <p className="font-medium text-sm">{currentScenario.datasetName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Model</p>
                  <p className="font-medium text-sm">{currentScenario.modelUsed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Study Hours</p>
                  <p className="font-medium text-sm">{currentScenario.parameters.studyHours}h/week</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Attendance</p>
                  <p className="font-medium text-sm">{currentScenario.parameters.attendanceRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tutorials</p>
                  <p className="font-medium text-sm">{currentScenario.parameters.tutorialSessions} sessions</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Outcome Change</p>
                  <Badge className={currentScenario.outcomeChange >= 0 ? 'bg-amber-600' : 'bg-red-500'}>
                    {currentScenario.outcomeChange >= 0 ? '+' : ''}{currentScenario.outcomeChange.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Total Insights</p>
                <p className="text-3xl text-blue-600">
                  {currentScenario ? generateScenarioInsights(currentScenario).length : insights.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Critical Alerts</p>
                <p className="text-3xl text-red-600">
                  {currentScenario 
                    ? generateScenarioInsights(currentScenario).filter(i => i.impact === 'Critical').length 
                    : insights.filter(i => i.impact === 'Critical').length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Key Findings</p>
                <p className="text-3xl text-teal-600">
                  {currentScenario 
                    ? generateScenarioInsights(currentScenario).filter(i => i.category === 'Scenario Finding').length 
                    : insights.filter(i => i.category === 'Key Finding').length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Interventions</p>
                <p className="text-3xl text-purple-600">
                  {currentScenario 
                    ? generateScenarioInsights(currentScenario).filter(i => i.category === 'Suggested Intervention').length 
                    : insights.filter(i => i.category === 'Suggested Intervention').length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(currentScenario ? generateScenarioInsights(currentScenario) : insights).map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className={`border-l-4 ${getCardBorderColor(insight.color)} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getIconColor(insight.color)}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{insight.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {insight.category === 'Suggested Intervention' && (
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        Implement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <p className="text-sm text-slate-500">Priority actions based on {currentScenario ? 'this scenario' : 'current insights'}</p>
          </CardHeader>
          <CardContent>
            {currentScenario ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">1</div>
                  <p className="text-sm">Review the scenario parameters and ensure they align with institutional capacity and resources</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white flex-shrink-0">2</div>
                  <p className="text-sm">Validate insights with department stakeholders before implementing interventions</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">3</div>
                  <p className="text-sm">Create an implementation timeline with measurable milestones for tracking progress</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">4</div>
                  <p className="text-sm">Generate a comprehensive report to share findings with leadership and faculty</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">1</div>
                  <p className="text-sm">Contact 14 high-risk students and schedule intervention meetings within 48 hours</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">2</div>
                  <p className="text-sm">Implement early warning system for attendance and assignment tracking</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">3</div>
                  <p className="text-sm">Increase tutorial session availability and promote participation through targeted outreach</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white flex-shrink-0">4</div>
                  <p className="text-sm">Launch peer study group pilot program with initial cohort of 60 students</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Step CTA */}
        <Card className="mt-6 border-amber-200 bg-gradient-to-r from-amber-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg mb-1">Ready to document your findings?</h3>
                <p className="text-sm text-slate-600">
                  {currentScenario 
                    ? 'Generate a comprehensive report for this scenario with all insights and recommendations.'
                    : 'Generate a comprehensive report with all your analysis, insights, and recommendations.'
                  }
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => onNavigate('reports')}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                {currentScenario ? 'Generate Scenario Report' : 'Generate Report'}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}