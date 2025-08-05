import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import BottomNavigation from "../components/BottomNavigation";

export default function ChangePassword() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call the backend API
      console.log("Password change request:", {
        userId: user?.id,
        email: user?.email,
      });

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Navigate back to settings after a short delay
      setTimeout(() => {
        navigate("/settings");
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder, 
    showPassword, 
    onToggleVisibility 
  }: {
    label: string;
    field: keyof typeof formData;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-explore-green focus:border-transparent"
          required
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-cabin max-w-md mx-auto">
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
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none" />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white flex items-center justify-between p-6 border-b border-gray-200">
        <Link to="/settings">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-xl font-bold text-black font-cabin">Change Password</h1>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                  Choose a strong password to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Current Password"
                field="currentPassword"
                placeholder="Enter your current password"
                showPassword={showPasswords.current}
                onToggleVisibility={() => togglePasswordVisibility('current')}
              />

              <InputField
                label="New Password"
                field="newPassword"
                placeholder="Enter your new password"
                showPassword={showPasswords.new}
                onToggleVisibility={() => togglePasswordVisibility('new')}
              />

              <InputField
                label="Confirm New Password"
                field="confirmPassword"
                placeholder="Confirm your new password"
                showPassword={showPasswords.confirm}
                onToggleVisibility={() => togglePasswordVisibility('confirm')}
              />

              {/* Password Requirements */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    At least 8 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    At least one number
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.newPassword !== formData.currentPassword && formData.newPassword.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    Different from current password
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-explore-green hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/settings")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
