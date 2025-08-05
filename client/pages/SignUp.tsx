import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { apiService } from "../services/apiService";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required fields validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Name is required";
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
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
      // First try backend registration
      const { data: backendResult, error: backendError } = await apiService.registerUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });

      if (backendResult?.success) {
        console.log('Backend registration successful:', backendResult);

        const isDemo = backendResult.user?.id?.includes("demo-user");

        toast({
          title: isDemo ? "Demo Account Created! 🎉" : "Account Created Successfully! 🎉",
          description: isDemo
            ? "Welcome to the demo! You can now explore all features."
            : "Welcome! Your account has been created and your profile is ready.",
        });

        // Redirect to login page for real users, or profile for demo users
        if (isDemo) {
          navigate("/profile");
        } else {
          navigate("/login", {
            state: {
              message: "Account created successfully! Please log in with your credentials.",
              email: formData.email
            }
          });
        }
        return;
      }

      // Fallback to Supabase auth if backend is unavailable
      if (backendError === 'BACKEND_UNAVAILABLE') {
        console.log('Backend unavailable, using Supabase auth fallback');

        const { user, error } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Failed to create account. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (user) {
          const isDemo = user.id?.includes("demo-user");

          toast({
            title: isDemo ? "Demo Account Created! 🎉" : "Account Created Successfully! 🎉",
            description: isDemo
              ? "Welcome to the demo! You can now explore all features."
              : "Welcome! Complete your profile to get started.",
          });

          // Redirect to onboarding/profile setup
          navigate("/onboarding");
        }
        return;
      }

      // Handle backend registration errors
      toast({
        title: "Sign Up Failed",
        description: backendResult?.error || "Failed to create account. Please try again.",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Registration error:', error);
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
        <h1 className="text-xl font-bold text-black font-cabin">Create Account</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="px-6 pb-20">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
            Join Wildpals
          </h2>
          <p className="text-gray-600 font-cabin">
            Connect with fellow outdoor enthusiasts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg font-cabin text-black placeholder-gray-500 ${
                  errors.full_name ? "border-red-500" : "border-gray-300"
                } focus:border-explore-green focus:outline-none`}
                disabled={loading}
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-2 font-cabin">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Email Address *
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
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 font-cabin">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Create a password"
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-lg font-cabin text-black placeholder-gray-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:border-explore-green focus:outline-none`}
                disabled={loading}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-lg font-medium text-black font-cabin mb-3">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-lg font-cabin text-black placeholder-gray-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:border-explore-green focus:outline-none`}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-2 font-cabin">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Text */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 font-cabin">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-explore-green font-medium underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-explore-green font-medium underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-explore-green text-white py-4 px-6 rounded-lg font-cabin font-medium text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600 font-cabin">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-explore-green font-bold underline font-cabin"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
