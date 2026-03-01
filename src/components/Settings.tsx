import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import Sidebar from './Sidebar';
import { Bell, Database, Palette, Home } from 'lucide-react';
import { Separator } from './ui/separator';
import { AuthUser } from './auth/AuthHeader';

interface SettingsProps {
  onNavigate: (page: string) => void;
  onWatchDemo?: () => void;
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

export default function Settings({ onNavigate, onWatchDemo, user, onLoginClick, onSignUpClick, onLogout }: SettingsProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage="settings" onNavigate={onNavigate} onWatchDemo={onWatchDemo} user={user} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} onLogout={onLogout} />
      
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and platform preferences</p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-600" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Model Completion Alerts</p>
                  <p className="text-sm text-slate-500">Get notified when models finish training</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Risk Alerts</p>
                  <p className="text-sm text-slate-500">Notifications for high-risk student detection</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-slate-500">Receive weekly analytics summary</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dataset Updates</p>
                  <p className="text-sm text-slate-500">Alert when new data is available</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-teal-600" />
                <CardTitle>Data Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Archive Old Datasets</p>
                  <p className="text-sm text-slate-500">Archive datasets older than 6 months</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Backup</p>
                  <p className="text-sm text-slate-500">Automatic daily backups</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Storage Usage</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>2.4 GB of 10 GB used</span>
                    <span className="text-slate-500">24%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-600" />
                <CardTitle>Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-slate-500">Use dark theme</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact View</p>
                  <p className="text-sm text-slate-500">Reduce spacing in tables and lists</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Back to Home Section */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                <CardTitle>Return to Home</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Go back to the PROSPECT landing page to learn more about the platform features and capabilities.
              </p>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => onNavigate('landing')}
              >
                <Home size={18} className="mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}