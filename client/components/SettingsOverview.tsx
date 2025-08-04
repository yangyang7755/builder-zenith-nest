import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Database,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  href: string;
}

const settingsCategories: SettingCategory[] = [
  {
    id: 'profile',
    title: 'Profile & Account',
    description: 'Personal information, email, password',
    icon: <User className="w-5 h-5" />,
    href: '/settings#profile'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Account security, data sharing, visibility',
    icon: <Shield className="w-5 h-5" />,
    badge: 'Important',
    href: '/settings#privacy'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Push, email, and activity alerts',
    icon: <Bell className="w-5 h-5" />,
    href: '/settings#notifications'
  },
  {
    id: 'preferences',
    title: 'App Preferences',
    description: 'Theme, language, units, display',
    icon: <Globe className="w-5 h-5" />,
    href: '/settings#preferences'
  },
  {
    id: 'data',
    title: 'Data & Storage',
    description: 'Export, import, offline mode',
    icon: <Database className="w-5 h-5" />,
    href: '/settings#data'
  },
  {
    id: 'support',
    title: 'Support & About',
    description: 'Help, feedback, app information',
    icon: <HelpCircle className="w-5 h-5" />,
    href: '/settings#support'
  }
];

export function SettingsOverview() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-6 w-6" />
          <div>
            <CardTitle>Settings & Preferences</CardTitle>
            <CardDescription>
              Manage your account, privacy, and app preferences
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {settingsCategories.map((category) => (
          <Link
            key={category.id}
            to={category.href}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
                {category.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{category.title}</p>
                  {category.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {category.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t">
          <Link 
            to="/settings" 
            className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Open Full Settings</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
