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

export interface Dataset {
  id: number;
  name: string;
  records: number;
  lastUpdated: string;
  status: string;
  quality: number;
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

export interface ScenarioResult {
  id: number;
  name: string;
  date: string;
  datasetName: string;
  modelUsed: string;
  parameters: {
    studyHours: number;
    attendanceRate: number;
    tutorialSessions: number;
    assignmentCompletion: number;
  };
  outcome: number;
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
    // Reset scroll flag after navigation
    setTimeout(() => setScrollToDemo(false), 500);
  };

  // Auth handlers
  const handleLogin = (email: string, _password: string, _rememberMe: boolean) => {
    // In a real app, this would call an API
    const newUser: AuthUser = {
      name: email.split('@')[0], // Use email username as name
      email,
      isGuest: false,
    };
    setUser(newUser);
    setShowAuthModal(false);
    toast.success(`Welcome back, ${newUser.name}!`);
    
    // Navigate to pending page if there is one
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSignUp = (name: string, email: string, _password: string) => {
    // In a real app, this would call an API
    const newUser: AuthUser = {
      name,
      email,
      isGuest: false,
    };
    setUser(newUser);
    setShowAuthModal(false);
    toast.success(`Account created! Welcome, ${name}!`);
    
    // Navigate to pending page if there is one
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
    
    // Navigate to pending page if there is one
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    // Clear any pending navigation
    setPendingNavigation(null);
    // Redirect to landing page
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

  // Handle getting started from landing page
  const handleGetStartedFromLanding = () => {
    // If user is already logged in, go directly to overview
    if (user) {
      setCurrentPage('overview');
    } else {
      // Show auth modal and set pending navigation
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
      
      {/* Auth Modal */}
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