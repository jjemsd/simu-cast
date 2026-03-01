import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import Overview from './components/Overview';
import PredictiveModeling from './components/PredictiveModeling';
import WhatIfScenarios from './components/WhatIfScenarios';
import InsightsAndReport from './components/InsightsAndReport';
import Settings from './components/Settings';
import History from './components/History';
import { Toaster } from './components/ui/sonner';
import { UnifiedAuthModal } from './components/auth/UnifiedAuthModal';
import { AuthUser } from './components/auth/AuthHeader';
import { toast } from 'sonner';

export interface QualityIssue {
  count: number;
  percentage: number;
  columns: string[];
}

export interface QualityReport {
  overall_quality: number;
  missing_values: QualityIssue;
  outliers: QualityIssue;
  duplicates: QualityIssue;
  text_issues: QualityIssue;
  invalid: QualityIssue;
}

export interface ColumnInfo {
  column: string;
  type: 'Numeric' | 'Date' | 'Text' | 'Categorical';
  missingCount: number;
}

export interface Dataset {
  id: number;
  datasetId: string;              // backend UUID for API calls
  name: string;
  records: number;
  columns: number;
  lastUpdated: string;
  status: string;
  quality: number;
  qualityReport: QualityReport | null;
  columnTypes: ColumnInfo[];      // from /preview
  previewRows: Record<string, unknown>[];  // from /preview
  type: 'Real' | 'Synthetic';
  inModeling?: boolean;
  performanceIssue?: boolean;
}

export interface ModelResult {
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface FeatureConfig {
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface ScenarioResult {
  id: number;
  name: string;
  date: string;
  datasetName: string;
  modelUsed: string;
  /** Keys are actual CSV column names; values are the slider values chosen */
  parameters: Record<string, number>;
  /** Statistical metadata per feature column, from the trained model */
  featureConfig?: Record<string, FeatureConfig>;
  outcome: number;
  baselineOutcome?: number;
  outcomeChange: number;
  selected?: boolean;
}

export interface AppState {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  selectedModel: string | null;
  targetVariable?: string;
  targetVariableLabel?: string;
  recommendedModel: string;
  modelResults: ModelResult | null;
  scenarios: ScenarioResult[];
  currentScenario: ScenarioResult | null;
  selectedScenariosForReport: number[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [scrollToDemo, setScrollToDemo] = useState(false);

  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Global state management for workflow context
  const [appState, setAppState] = useState<AppState>({
    datasets: [],
    selectedDataset: null,
    selectedModel: null,
    recommendedModel: 'random-forest',
    modelResults: null,
    scenarios: [],
    currentScenario: null,
    selectedScenariosForReport: [],
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const handleNavigateToDemo = () => {
    setCurrentPage('landing');
    setScrollToDemo(true);
    setTimeout(() => setScrollToDemo(false), 500);
  };

  // Auth handlers
  const handleLogin = (email: string, _password: string, _rememberMe: boolean) => {
    const newUser: AuthUser = {
      name: email.split('@')[0],
      email,
      isGuest: false,
    };
    setUser(newUser);
    setShowAuthModal(false);
    toast.success(`Welcome back, ${newUser.name}!`);
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSignUp = (name: string, email: string, _password: string) => {
    const newUser: AuthUser = {
      name,
      email,
      isGuest: false,
    };
    setUser(newUser);
    setShowAuthModal(false);
    toast.success(`Account created! Welcome, ${name}!`);
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: AuthUser = {
      name: 'Guest User',
      email: '',
      isGuest: true,
    };
    setUser(guestUser);
    toast.info('Continuing as guest. Login to save your work.');
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPendingNavigation(null);
    setCurrentPage('landing');
    toast.info('Logged out successfully');
  };

  const handleOpenLoginModal = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleOpenSignUpModal = () => {
    setAuthModalTab('signup');
    setShowAuthModal(true);
  };

  const handleGetStartedFromLanding = () => {
    if (user) {
      setCurrentPage('overview');
    } else {
      setPendingNavigation('overview');
      setAuthModalTab('login');
      setShowAuthModal(true);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={handleGetStartedFromLanding}
            scrollToDemo={scrollToDemo}
            onShowAuth={handleGetStartedFromLanding}
          />
        );
      case 'overview':
        return (
          <Overview
            onNavigate={setCurrentPage}
            appState={appState}
            updateAppState={updateAppState}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      case 'modeling':
        return (
          <PredictiveModeling
            onNavigate={setCurrentPage}
            appState={appState}
            updateAppState={updateAppState}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      case 'scenarios':
        return (
          <WhatIfScenarios
            onNavigate={setCurrentPage}
            appState={appState}
            updateAppState={updateAppState}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      case 'insights':
      case 'reports':
        return (
          <InsightsAndReport
            onNavigate={setCurrentPage}
            appState={appState}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <Settings
            onNavigate={setCurrentPage}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      case 'history':
        return (
          <History
            onNavigate={setCurrentPage}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Overview
            onNavigate={setCurrentPage}
            appState={appState}
            updateAppState={updateAppState}
            onWatchDemo={handleNavigateToDemo}
            user={user}
            onLoginClick={handleOpenLoginModal}
            onSignUpClick={handleOpenSignUpModal}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster />
      <UnifiedAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGuestLogin={handleGuestLogin}
        initialTab={authModalTab}
      />
    </>
  );
}
