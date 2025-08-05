import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  Globe,
  Eye,
  MapPin,
  Smartphone,
  CreditCard,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Camera,
  Database,
  Download,
  Upload,
  Languages,
  Accessibility,
  Zap,
  Target,
  MessageSquare,
  Users,
  Activity,
  Calendar,
  Clock,
  Wifi,
  Bluetooth,
  Share2,
  Star,
  Trophy,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import BottomNavigation from "../components/BottomNavigation";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";

export default function EnhancedSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Settings State
  const [preferences, setPreferences] = useState({
    // Theme & Display
    darkMode: false,
    highContrast: false,
    fontSize: "medium",
    language: "en",

    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    activityReminders: true,
    messageAlerts: true,
    reviewNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,

    // Privacy & Security
    profileVisibility: "public",
    showLocation: true,
    showActivity: true,
    allowMessageRequests: true,
    dataSharing: false,
    analyticsOptOut: false,

    // Activity Preferences
    defaultActivityRadius: 25,
    autoJoinActivities: false,
    showDifficulty: true,
    preferredUnits: "metric",
    defaultMapView: "hybrid",

    // Social Features
    allowFollowers: true,
    shareAchievements: true,
    showOnlineStatus: true,
    autoAcceptFriends: false,

    // App Behavior
    offlineMode: false,
    autoDownloadMaps: false,
    backgroundSync: true,
    energySaving: false,
    hapticFeedback: true,
    soundEffects: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const loadSavedPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem("userPreferences");
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          setPreferences((prev) => ({ ...prev, ...parsed }));
          console.log(
            "Loaded saved preferences:",
            Object.keys(parsed).length,
            "settings",
          );
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadSavedPreferences();
  }, []);

  const updatePreference = async (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Save to localStorage for persistence
    try {
      localStorage.setItem("userPreferences", JSON.stringify(newPreferences));

      // If user is logged in, save to backend profile
      if (user) {
        // Update the user's profile with new preferences
        // This could be expanded to include preferences in the profile data
        console.log("Saving preference to backend:", key, value);
      }

      toast({
        title: "Setting Updated",
        description: "Your preference has been saved.",
      });
    } catch (error) {
      console.error("Failed to save preference:", error);
      toast({
        title: "Error",
        description: "Failed to save setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      // Clear all local data
      localStorage.clear();

      // Sign out user
      await signOut();

      // In a real app, this would call an API to delete the account
      toast({
        title: "Account Deletion",
        description:
          "Account deletion process started. You'll receive a confirmation email.",
        variant: "destructive",
      });

      setShowDeleteConfirm(false);
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    try {
      // Collect user data for export
      const userData = {
        preferences,
        profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };

      // Create downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `wildpals-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importData = () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target?.result as string);

              // Validate data structure
              if (importedData.preferences) {
                setPreferences(importedData.preferences);
                localStorage.setItem(
                  "userPreferences",
                  JSON.stringify(importedData.preferences),
                );
              }

              toast({
                title: "Data Import Complete",
                description: "Your settings have been imported successfully.",
              });
            } catch (error) {
              toast({
                title: "Import Failed",
                description:
                  "Invalid file format. Please select a valid export file.",
                variant: "destructive",
              });
            }
          };
          reader.readAsText(file);
        }
      };

      input.click();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Additional important settings functions
  const clearCache = async () => {
    try {
      // Clear browser cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage except preferences
      const preferences = localStorage.getItem("userPreferences");
      localStorage.clear();
      if (preferences) {
        localStorage.setItem("userPreferences", preferences);
      }

      toast({
        title: "Cache Cleared",
        description: "App cache has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetToDefault = async () => {
    try {
      // Reset all preferences to default
      const defaultPrefs = {
        darkMode: false,
        highContrast: false,
        fontSize: "medium",
        language: "en",
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        activityReminders: true,
        messageAlerts: true,
        reviewNotifications: true,
        marketingEmails: false,
        weeklyDigest: true,
        profileVisibility: "public",
        showLocation: true,
        showActivity: true,
        allowMessageRequests: true,
        dataSharing: false,
        analyticsOptOut: false,
        defaultActivityRadius: 25,
        autoJoinActivities: false,
        showDifficulty: true,
        preferredUnits: "metric",
        defaultMapView: "hybrid",
        allowFollowers: true,
        shareAchievements: true,
        showOnlineStatus: true,
        autoAcceptFriends: false,
        offlineMode: false,
        autoDownloadMaps: false,
        backgroundSync: true,
        energySaving: false,
        hapticFeedback: true,
        soundEffects: true,
      };

      setPreferences(defaultPrefs);
      localStorage.setItem("userPreferences", JSON.stringify(defaultPrefs));

      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestDataDownload = async () => {
    try {
      // Simulate API call for complete data download
      toast({
        title: "Data Download Requested",
        description: "You'll receive an email with your complete data archive within 24 hours.",
      });

      // In a real app, this would trigger a backend process
      console.log("Data download requested for user:", user?.email);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const changePassword = () => {
    // Navigate to password change page or show modal
    navigate("/settings/change-password");
  };

  const manageTwoFactor = () => {
    // Navigate to 2FA settings
    navigate("/settings/two-factor");
  };

  const manageConnectedApps = () => {
    // Navigate to connected apps management
    navigate("/settings/connected-apps");
  };

  const contactSupport = () => {
    // Open support chat or email
    const subject = encodeURIComponent("Support Request - WildPals App");
    const body = encodeURIComponent(`
Hi WildPals Support Team,

I need assistance with:

[Please describe your issue here]

User ID: ${user?.id || 'Not logged in'}
App Version: 1.0.0
Device: ${navigator.userAgent}

Thank you!
    `);

    window.open(`mailto:support@wildpals.com?subject=${subject}&body=${body}`);
  };

  const shareApp = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "WildPals - Find Your Adventure",
          text: "Join me on WildPals and discover amazing outdoor activities!",
          url: "https://wildpals.com/download",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText("https://wildpals.com/download");
        toast({
          title: "Link Copied",
          description: "Download link copied to clipboard!",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const provideFeedback = () => {
    // Open feedback form
    window.open("https://forms.gle/wildpals-feedback", "_blank");
  };

  const viewPrivacyPolicy = () => {
    navigate("/privacy");
  };

  const viewTermsOfService = () => {
    navigate("/terms");
  };

  // Settings Section Component
  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );

  // Settings Item Component
  const SettingsItem = ({
    icon,
    title,
    subtitle,
    rightContent,
    onClick,
    badge,
    danger = false,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
    onClick?: () => void;
    badge?: string;
    danger?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        danger ? "hover:bg-red-50" : "hover:bg-gray-50"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${danger ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`font-medium ${danger ? "text-red-600" : "text-gray-900"}`}
            >
              {title}
            </h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        {onClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-cabin max-w-2xl mx-auto relative">
      {/* Header */}
      <div className="bg-white flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-10">
        <Link to="/profile">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-xl font-bold text-black font-cabin">Settings</h1>
        <div className="w-6"></div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20 px-6 pt-6">
        {/* Account & Profile */}
        <SettingsSection title="Account & Profile">
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            title="Edit Profile"
            subtitle="Update your personal information and photo"
            onClick={() => navigate("/profile/edit-comprehensive")}
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Email Address"
            subtitle={user?.email || "Not set"}
            onClick={() =>
              toast({
                title: "Email Settings",
                description: "Email change coming soon.",
              })
            }
          />
          <SettingsItem
            icon={<Lock className="w-5 h-5" />}
            title="Change Password"
            subtitle="Update your account password"
            onClick={changePassword}
          />
          <SettingsItem
            icon={<MapPin className="w-5 h-5" />}
            title="Location Services"
            subtitle="Manage location sharing and accuracy"
            rightContent={
              <Switch
                checked={preferences.showLocation}
                onCheckedChange={(checked) =>
                  updatePreference("showLocation", checked)
                }
              />
            }
          />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon={<Shield className="w-5 h-5" />}
            title="Account Security"
            subtitle="Two-factor authentication, login history"
            onClick={manageTwoFactor}
            badge="Secure"
          />
          <SettingsItem
            icon={<Eye className="w-5 h-5" />}
            title="Profile Visibility"
            subtitle={
              preferences.profileVisibility === "public" ? "Public" : "Private"
            }
            rightContent={
              <Switch
                checked={preferences.profileVisibility === "public"}
                onCheckedChange={(checked) =>
                  updatePreference(
                    "profileVisibility",
                    checked ? "public" : "private",
                  )
                }
              />
            }
          />
          <SettingsItem
            icon={<Users className="w-5 h-5" />}
            title="Social Privacy"
            subtitle="Control who can follow and message you"
            rightContent={
              <Switch
                checked={preferences.allowFollowers}
                onCheckedChange={(checked) =>
                  updatePreference("allowFollowers", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Activity className="w-5 h-5" />}
            title="Activity Privacy"
            subtitle="Show your activities and achievements"
            rightContent={
              <Switch
                checked={preferences.showActivity}
                onCheckedChange={(checked) =>
                  updatePreference("showActivity", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Database className="w-5 h-5" />}
            title="Data Sharing"
            subtitle="Share anonymized data for app improvement"
            rightContent={
              <Switch
                checked={preferences.dataSharing}
                onCheckedChange={(checked) =>
                  updatePreference("dataSharing", checked)
                }
              />
            }
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell className="w-5 h-5" />}
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            rightContent={
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) =>
                  updatePreference("pushNotifications", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Email Notifications"
            subtitle="Activity updates, messages, and reminders"
            rightContent={
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  updatePreference("emailNotifications", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<MessageSquare className="w-5 h-5" />}
            title="Message Alerts"
            subtitle="Get notified of new messages and chats"
            rightContent={
              <Switch
                checked={preferences.messageAlerts}
                onCheckedChange={(checked) =>
                  updatePreference("messageAlerts", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Calendar className="w-5 h-5" />}
            title="Activity Reminders"
            subtitle="Reminders before joined activities"
            rightContent={
              <Switch
                checked={preferences.activityReminders}
                onCheckedChange={(checked) =>
                  updatePreference("activityReminders", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Star className="w-5 h-5" />}
            title="Review Notifications"
            subtitle="When you receive reviews and ratings"
            rightContent={
              <Switch
                checked={preferences.reviewNotifications}
                onCheckedChange={(checked) =>
                  updatePreference("reviewNotifications", checked)
                }
              />
            }
          />
        </SettingsSection>

        {/* App Preferences */}
        <SettingsSection title="App Preferences">
          <SettingsItem
            icon={
              preferences.darkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )
            }
            title="Dark Mode"
            subtitle="Use dark theme for better low-light viewing"
            rightContent={
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) =>
                  updatePreference("darkMode", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Languages className="w-5 h-5" />}
            title="Language"
            subtitle="English (US)"
            onClick={() =>
              toast({
                title: "Language",
                description: "Language selection coming soon.",
              })
            }
          />
          <SettingsItem
            icon={<Globe className="w-5 h-5" />}
            title="Units"
            subtitle={
              preferences.preferredUnits === "metric"
                ? "Metric (km, kg)"
                : "Imperial (mi, lbs)"
            }
            onClick={() =>
              updatePreference(
                "preferredUnits",
                preferences.preferredUnits === "metric" ? "imperial" : "metric",
              )
            }
          />
          <SettingsItem
            icon={<Target className="w-5 h-5" />}
            title="Default Search Radius"
            subtitle={`${preferences.defaultActivityRadius} km`}
            onClick={() =>
              toast({
                title: "Search Radius",
                description: "Radius settings coming soon.",
              })
            }
          />
          <SettingsItem
            icon={<Smartphone className="w-5 h-5" />}
            title="Haptic Feedback"
            subtitle="Vibration feedback for interactions"
            rightContent={
              <Switch
                checked={preferences.hapticFeedback}
                onCheckedChange={(checked) =>
                  updatePreference("hapticFeedback", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Volume2 className="w-5 h-5" />}
            title="Sound Effects"
            subtitle="Audio feedback for app interactions"
            rightContent={
              <Switch
                checked={preferences.soundEffects}
                onCheckedChange={(checked) =>
                  updatePreference("soundEffects", checked)
                }
              />
            }
          />
        </SettingsSection>

        {/* Data & Storage */}
        <SettingsSection title="Data & Storage">
          <SettingsItem
            icon={<Database className="w-5 h-5" />}
            title="Database Management"
            subtitle="Configure database connection and settings"
            onClick={() => navigate("/database-management")}
            badge="Admin"
          />
          <SettingsItem
            icon={<Download className="w-5 h-5" />}
            title="Export Data"
            subtitle="Download your personal data"
            onClick={exportData}
          />
          <SettingsItem
            icon={<Upload className="w-5 h-5" />}
            title="Import Data"
            subtitle="Import data from other apps"
            onClick={importData}
          />
          <SettingsItem
            icon={<Wifi className="w-5 h-5" />}
            title="Offline Mode"
            subtitle="Use app without internet connection"
            rightContent={
              <Switch
                checked={preferences.offlineMode}
                onCheckedChange={(checked) =>
                  updatePreference("offlineMode", checked)
                }
              />
            }
          />
          <SettingsItem
            icon={<Zap className="w-5 h-5" />}
            title="Background Sync"
            subtitle="Sync data when app is not active"
            rightContent={
              <Switch
                checked={preferences.backgroundSync}
                onCheckedChange={(checked) =>
                  updatePreference("backgroundSync", checked)
                }
              />
            }
          />
        </SettingsSection>

        {/* Support & About */}
        <SettingsSection title="Support & About">
          <SettingsItem
            icon={<HelpCircle className="w-5 h-5" />}
            title="Help & Support"
            subtitle="FAQ, contact support, tutorials"
            onClick={contactSupport}
          />
          <SettingsItem
            icon={<Share2 className="w-5 h-5" />}
            title="Share App"
            subtitle="Invite friends to join the community"
            onClick={shareApp}
          />
          <SettingsItem
            icon={<Star className="w-5 h-5" />}
            title="Rate App"
            subtitle="Leave a review on the app store"
            onClick={provideFeedback}
          />
          <SettingsItem
            icon={<SettingsIcon className="w-5 h-5" />}
            title="App Version"
            subtitle="Version 1.0.0 (Build 1)"
            badge="Latest"
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account Actions">
          <SettingsItem
            icon={<LogOut className="w-5 h-5" />}
            title="Sign Out"
            subtitle="Sign out of your account"
            onClick={handleSignOut}
          />
          <SettingsItem
            icon={<Trash2 className="w-5 h-5" />}
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onClick={handleDeleteAccount}
            danger={true}
          />
        </SettingsSection>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <CardDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
