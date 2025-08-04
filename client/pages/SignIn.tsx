import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/explore";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Sign In Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account first.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message || "Failed to sign in. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (user) {
        const isDemo = user.id?.includes("demo-user");
        
        toast({
          title: isDemo ? "Demo Sign In Successful! 🎉" : "Welcome back! 🎉",
          description: isDemo
            ? "Exploring demo mode with sample data."
            : "You have successfully signed in.",
        });
        
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
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

      {/* Navigation Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Sign In</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="px-6 pb-20">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 font-cabin">
            Sign in to continue your adventure
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg font-cabin text-black placeholder-gray-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:border-explore-green focus:outline-none`}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 font-cabin">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-lg font-cabin text-black placeholder-gray-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:border-explore-green focus:outline-none`}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-2 font-cabin">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-explore-green font-medium underline font-cabin"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-explore-green text-white py-4 px-6 rounded-lg font-cabin font-medium text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600 font-cabin">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-explore-green font-bold underline font-cabin"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-green-800 font-medium mb-1 font-cabin">
              🚀 Demo Mode Active
            </p>
            <p className="text-xs text-green-600 font-cabin">
              Try any email and password to explore the app with sample data!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
