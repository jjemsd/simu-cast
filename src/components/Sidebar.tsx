import { Upload, Brain, Shuffle, Lightbulb, BarChart3, Play, History } from 'lucide-react';
import { Button } from './ui/button';
import { AuthHeader, AuthUser } from './auth/AuthHeader';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  appState?: any;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: SidebarProps) {
  const navigationItems = [
    { id: 'overview', label: 'Data Preparation', icon: Upload },
    { id: 'modeling', label: 'Build Models', icon: Brain },
    { id: 'scenarios', label: 'Test Scenarios', icon: Shuffle },
    { id: 'insights', label: 'Insights & Report', icon: Lightbulb },
    { id: 'history', label: 'History', icon: History, requiresAuth: true },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity mb-4"
          onClick={() => onNavigate('landing')}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="text-slate-800" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg">SimuCast</h1>
            <p className="text-xs text-slate-500">Predictive Analytics</p>
          </div>
        </div>
        
        {/* Auth Header */}
        <div className="pt-2">
          <AuthHeader
            user={user}
            onLoginClick={onLoginClick}
            onSignUpClick={onSignUpClick}
            onLogout={onLogout}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            // Hide items that require auth if user is guest
            if (item.requiresAuth && user?.isGuest) {
              return null;
            }

            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'insights' && currentPage === 'reports');
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`w-full justify-start px-4 py-3 h-auto transition-colors ${
                  isActive 
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  className={`mr-3 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} 
                  size={20} 
                />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-6 pb-6 space-y-4">
        {/* Demo Video Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 mb-3">
            New to SimuCast? Watch the demo walkthrough.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 bg-white hover:bg-amber-50 border-amber-300 text-amber-800 hover:text-amber-900"
            onClick={onWatchDemo || (() => onNavigate('landing'))}
          >
            <Play size={14} />
            <span className="text-xs">Watch Demo</span>
          </Button>
        </div>

        {/* Logout Button - Only shown for registered users, not guests */}
        {user && !user.isGuest && (
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={onLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="text-sm">Logout</span>
          </Button>
        )}

        {/* Version Info */}
        <div className="text-xs text-slate-400 space-y-0.5">
          <p>SimuCast v1.0.0</p>
          <p>© 2025 Analytics Platform</p>
        </div>
      </div>
    </div>
  );
}