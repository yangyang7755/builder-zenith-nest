import { useState } from "react";
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
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    activities: true,
    messages: true,
    reviews: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: "public",
    showLocation: true,
    showActivities: true,
    messageRequests: "everyone",
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    alert("Account deletion requested. You will receive a confirmation email.");
    setShowDeleteConfirm(false);
    navigate("/auth");
  };

  const handleLogout = () => {
    // In a real app, this would clear auth tokens and user data
    alert("Logged out successfully");
    navigate("/auth");
  };

  const handleEmailChange = () => {
    const newEmail = prompt("Enter new email address:", "ben.stuart@email.com");
    if (newEmail && newEmail.includes("@")) {
      alert(
        `Email will be changed to ${newEmail}. Please check your inbox for verification.`,
      );
    }
  };

  const handlePasswordChange = () => {
    const currentPassword = prompt("Enter current password:");
    if (currentPassword) {
      const newPassword = prompt("Enter new password:");
      if (newPassword && newPassword.length >= 6) {
        alert("Password updated successfully!");
      } else if (newPassword) {
        alert("Password must be at least 6 characters long.");
      }
    }
  };

  const handleLocationChange = () => {
    const newLocation = prompt("Enter new location:", "Notting Hill, London");
    if (newLocation) {
      alert(`Location updated to: ${newLocation}`);
    }
  };

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-black font-cabin mb-4">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onClick,
    rightContent,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    rightContent?: React.ReactNode;
  }) => (
    <div
      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="text-explore-green">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-black font-cabin">{title}</div>
        {subtitle && (
          <div className="text-sm text-gray-600 font-cabin">{subtitle}</div>
        )}
      </div>
      {rightContent || <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  }) => (
    <div
      className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-explore-green" : "bg-gray-300"
      }`}
      onClick={() => onChange(!enabled)}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-0.5"
        } mt-0.5`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-cabin max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white flex items-center justify-between p-6 pb-4 border-b border-gray-200">
        <button onClick={handleBack}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Settings</h1>
        <div className="w-6"></div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20 px-6 pt-6">
        {/* Profile Settings */}
        <SettingsSection title="Profile">
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            title="Edit Profile"
            subtitle="Update your info and profile photo"
            onClick={() => navigate("/profile/edit-comprehensive")}
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Email"
            subtitle="ben.stuart@email.com"
            onClick={handleEmailChange}
          />
          <SettingsItem
            icon={<Lock className="w-5 h-5" />}
            title="Change Password"
            subtitle="Update your account password"
            onClick={handlePasswordChange}
          />
          <SettingsItem
            icon={<MapPin className="w-5 h-5" />}
            title="Location"
            subtitle="Notting Hill, London"
            onClick={handleLocationChange}
          />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon={<Shield className="w-5 h-5" />}
            title="Privacy Settings"
            subtitle="Control who can see your information"
            onClick={() => alert("Privacy settings coming soon")}
          />
          <SettingsItem
            icon={<Eye className="w-5 h-5" />}
            title="Profile Visibility"
            subtitle={
              privacy.profileVisible === "public" ? "Public" : "Private"
            }
            rightContent={
              <ToggleSwitch
                enabled={privacy.profileVisible === "public"}
                onChange={(enabled) =>
                  setPrivacy({
                    ...privacy,
                    profileVisible: enabled ? "public" : "private",
                  })
                }
              />
            }
          />
          <SettingsItem
            icon={<MapPin className="w-5 h-5" />}
            title="Show Location"
            subtitle="Let others see your location"
            rightContent={
              <ToggleSwitch
                enabled={privacy.showLocation}
                onChange={(enabled) =>
                  setPrivacy({ ...privacy, showLocation: enabled })
                }
              />
            }
          />
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            title="Activity Visibility"
            subtitle="Show your activities to others"
            rightContent={
              <ToggleSwitch
                enabled={privacy.showActivities}
                onChange={(enabled) =>
                  setPrivacy({ ...privacy, showActivities: enabled })
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
              <ToggleSwitch
                enabled={notifications.push}
                onChange={(enabled) =>
                  setNotifications({ ...notifications, push: enabled })
                }
              />
            }
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Email Notifications"
            subtitle="Receive notifications via email"
            rightContent={
              <ToggleSwitch
                enabled={notifications.email}
                onChange={(enabled) =>
                  setNotifications({ ...notifications, email: enabled })
                }
              />
            }
          />
          <SettingsItem
            icon={<Smartphone className="w-5 h-5" />}
            title="SMS Notifications"
            subtitle="Receive notifications via SMS"
            rightContent={
              <ToggleSwitch
                enabled={notifications.sms}
                onChange={(enabled) =>
                  setNotifications({ ...notifications, sms: enabled })
                }
              />
            }
          />
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            title="Activity Updates"
            subtitle="Get notified about new activities"
            rightContent={
              <ToggleSwitch
                enabled={notifications.activities}
                onChange={(enabled) =>
                  setNotifications({ ...notifications, activities: enabled })
                }
              />
            }
          />
        </SettingsSection>

        {/* App Preferences */}
        <SettingsSection title="App Preferences">
          <SettingsItem
            icon={
              darkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )
            }
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightContent={
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
            }
          />
          <SettingsItem
            icon={<Globe className="w-5 h-5" />}
            title="Language"
            subtitle="English (UK)"
            onClick={() => alert("Language settings coming soon")}
          />
          <SettingsItem
            icon={<Volume2 className="w-5 h-5" />}
            title="Sound Effects"
            subtitle="App sounds and feedback"
            rightContent={<ToggleSwitch enabled={true} onChange={() => {}} />}
          />
        </SettingsSection>

        {/* Payment & Billing */}
        <SettingsSection title="Payment & Billing">
          <SettingsItem
            icon={<CreditCard className="w-5 h-5" />}
            title="Payment Methods"
            subtitle="Manage your payment information"
            onClick={() => alert("Payment settings coming soon")}
          />
          <SettingsItem
            icon={<CreditCard className="w-5 h-5" />}
            title="Subscription"
            subtitle="Free Plan • Upgrade available"
            onClick={() => alert("Subscription management coming soon")}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support & About">
          <SettingsItem
            icon={<HelpCircle className="w-5 h-5" />}
            title="Help Center"
            subtitle="Get help and find answers"
            onClick={() => alert("Help center coming soon")}
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onClick={() => alert("Contact support coming soon")}
          />
          <SettingsItem
            icon={<Shield className="w-5 h-5" />}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onClick={() => alert("Privacy policy coming soon")}
          />
          <SettingsItem
            icon={<Globe className="w-5 h-5" />}
            title="Terms of Service"
            subtitle="Read our terms of service"
            onClick={() => alert("Terms of service coming soon")}
          />
          <SettingsItem
            icon={<Smartphone className="w-5 h-5" />}
            title="App Version"
            subtitle="v1.0.0 (Build 123)"
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<LogOut className="w-5 h-5 text-orange-500" />}
            title="Log Out"
            subtitle="Sign out of your account"
            onClick={handleLogout}
          />
          <SettingsItem
            icon={<Trash2 className="w-5 h-5 text-red-500" />}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onClick={handleDeleteAccount}
          />
        </SettingsSection>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-black font-cabin mb-2">
                Delete Account
              </h3>
              <p className="text-gray-600 font-cabin">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently removed.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={confirmDeleteAccount}
                className="w-full py-3 bg-red-500 text-white rounded-lg font-cabin font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
