import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Crown,
  MessageCircle,
  Calendar,
} from 'lucide-react';

export default function UserNav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/explore');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // If user is not signed in, show sign in/up buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/signin">
            <LogIn className="h-4 w-4 mr-1" />
            Sign In
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/signup">
            <UserPlus className="h-4 w-4 mr-1" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  // If user is signed in, show user menu
  return (
    <div className="flex items-center gap-3">
      {/* Quick Actions */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/chat">
          <MessageCircle className="h-4 w-4 mr-1" />
          Chat
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link to="/create">
          <Calendar className="h-4 w-4 mr-1" />
          Create
        </Link>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={profile?.profile_image} 
                alt={profile?.full_name || user.email || 'User'} 
              />
              <AvatarFallback>
                {profile?.full_name 
                  ? getInitials(profile.full_name) 
                  : getInitials(user.email?.split('@')[0] || 'U')
                }
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {profile?.university && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {profile.university}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/saved">
              <Calendar className="mr-2 h-4 w-4" />
              <span>My Activities</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Compact version for mobile navigation
export function UserNavMobile() {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link to="/signin">
            <LogIn className="h-4 w-4 mr-1" />
            Sign In
          </Link>
        </Button>
        <Button size="sm" asChild className="w-full">
          <Link to="/signup">
            <UserPlus className="h-4 w-4 mr-1" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={profile?.profile_image} 
            alt={profile?.full_name || user.email || 'User'} 
          />
          <AvatarFallback>
            {profile?.full_name 
              ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : user.email?.split('@')[0]?.charAt(0).toUpperCase() || 'U'
            }
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {profile?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile">
            <User className="h-4 w-4 mr-1" />
            Profile
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
