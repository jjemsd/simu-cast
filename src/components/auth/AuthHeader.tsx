import { User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export interface AuthUser {
  name: string;
  email: string;
  isGuest: boolean;
}

interface AuthHeaderProps {
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
}

export function AuthHeader({ user, onLoginClick, onSignUpClick, onLogout }: AuthHeaderProps) {
  if (!user) {
    // Not logged in - show Login and Sign Up buttons
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onLoginClick}
          className="text-slate-600 hover:text-slate-900"
        >
          Login
        </Button>
        <Button
          onClick={onSignUpClick}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          Sign Up
        </Button>
      </div>
    );
  }

  if (user.isGuest) {
    // Guest mode - show guest badge and login option
    return (
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className="border-amber-400 text-amber-700 bg-amber-50 px-3 py-1"
        >
          Guest Session
        </Badge>
        <Button
          size="sm"
          onClick={onLoginClick}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          Login to Save
        </Button>
      </div>
    );
  }

  // Logged in - show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-slate-100"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-700">
          <LogOut size={16} className="mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
