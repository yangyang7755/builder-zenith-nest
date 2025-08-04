import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { 
  Settings,
  Moon,
  Sun,
  Bell,
  MapPin,
  Shield,
  Volume2,
  ChevronRight,
  X
} from 'lucide-react';

interface SettingsQuickAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsQuickAccess({ isOpen, onClose }: SettingsQuickAccessProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Quick Settings</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Push notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Location Sharing */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-gray-500">Share your location</p>
                </div>
              </div>
              <Switch
                checked={locationSharing}
                onCheckedChange={setLocationSharing}
              />
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-gray-500">Audio feedback</p>
                </div>
              </div>
              <Switch
                checked={soundEffects}
                onCheckedChange={setSoundEffects}
              />
            </div>

            {/* Privacy Shortcut */}
            <Link 
              to="/settings" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Privacy & Security</p>
                  <p className="text-sm text-gray-500">Account security settings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Link to="/settings" onClick={onClose}>
              <Button className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                All Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
