import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';

interface UnifiedAuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onSignUp: (name: string, email: string, password: string) => void;
  onGuestLogin: () => void;
  initialTab?: 'login' | 'signup';
}

export function UnifiedAuthModal({ 
  open, 
  onClose, 
  onLogin, 
  onSignUp, 
  onGuestLogin,
  initialTab = 'login' 
}: UnifiedAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset form when switching tabs
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    // Reset forms
    setLoginEmail('');
    setLoginPassword('');
    setRememberMe(false);
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      onLogin(loginEmail, loginPassword, rememberMe);
      setIsLoading(false);
      handleTabChange('login'); // Reset form
    }, 500);
  };

  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      onSignUp(signupName, signupEmail, signupPassword);
      setIsLoading(false);
      handleTabChange('signup'); // Reset form
    }, 500);
  };

  const handleGuestLogin = () => {
    onGuestLogin();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Accessibility - Hidden title and description */}
        <DialogTitle className="sr-only">
          {activeTab === 'login' ? 'Login to PROSPECT' : 'Sign Up for PROSPECT'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {activeTab === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Create a new account to get started'}
        </DialogDescription>

        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all relative ${
              activeTab === 'login'
                ? 'text-slate-900 bg-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            Login
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all relative ${
              activeTab === 'signup'
                ? 'text-slate-900 bg-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            Sign Up
            {activeTab === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            // Login Tab
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-600">
                  Sign in to access your saved scenarios and analysis
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-600 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-300 hover:bg-slate-50"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  Continue as Guest
                </Button>

                <div className="text-center text-sm text-slate-600 pt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Sign Up Tab
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Create Account</h2>
                <p className="text-sm text-slate-600">
                  Sign up to save your scenarios and access advanced features
                </p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-md mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className="text-center text-sm text-slate-600 pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                    disabled={isLoading}
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}