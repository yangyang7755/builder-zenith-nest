import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { apiService } from "../services/apiService";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginEnhanced() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Show success message if coming from registration
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Success! 🎉",
        description: location.state.message,
      });
      
      // Pre-fill email if provided
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }
  }, [location, toast]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // First try backend login
      const { data: backendResult, error: backendError } = await apiService.loginUser({
        email,
        password,
      });

      if (backendResult?.success) {
        console.log('Backend login successful:', backendResult);
        
        const isDemo = backendResult.user?.id?.includes("demo-user");
        
        toast({
          title: isDemo ? "Demo Login Successful! 🎉" : "Welcome Back! 🎉",
          description: isDemo
            ? "You're now logged into the demo account."
            : `Welcome back, ${backendResult.profile?.full_name || 'User'}!`,
        });

        // Navigate to profile or explore page
        navigate("/explore");
        return;
      }

      // Fallback to Supabase auth if backend is unavailable
      if (backendError === 'BACKEND_UNAVAILABLE') {
        console.log('Backend unavailable, using Supabase auth fallback');
        
        const { user, error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Login Failed",
            description: error.message || "Invalid email or password. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (user) {
          const isDemo = user.id?.includes("demo-user");
          
          toast({
            title: isDemo ? "Demo Login Successful! 🎉" : "Welcome Back! 🎉",
            description: isDemo
              ? "You're now logged into the demo account."
              : "Welcome back!",
          });

          navigate("/explore");
        }
        return;
      }

      // Handle backend login errors
      toast({
        title: "Login Failed",
        description: backendResult?.error || "Invalid email or password. Please try again.",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      <div className="flex flex-col justify-center items-center px-7 py-16 min-h-screen">
        {/* Back Button */}
        <div className="absolute top-8 left-7">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 mb-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F9e47fe83fd834e79a57361f8a278d9a9?format=webp&width=800"
              alt="Wildpals Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-black font-cabin mb-2">
            Wildpals
          </h2>
        </div>

        {/* Welcome Back Title */}
        <h1 className="text-4xl text-black text-center font-cabin mb-12">
          Welcome Back
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-explore-green'} rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 font-cabin">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border-2 ${errors.password ? 'border-red-500' : 'border-explore-green'} rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green pr-16`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-explore-green hover:text-explore-green/80 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 font-cabin">{errors.password}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-explore-green text-white py-3 px-6 rounded-lg font-cabin text-base mt-6 hover:bg-explore-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Forgot Password */}
          <div className="text-center pt-4">
            <button 
              type="button"
              className="text-black font-cabin text-base hover:text-explore-green transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Divider */}
          <div className="text-center py-4">
            <span className="text-gray-400 font-cabin text-base">or</span>
          </div>

          {/* Continue with Apple */}
          <button 
            type="button"
            className="w-full border-2 border-explore-green bg-white text-explore-green py-3 px-6 rounded-lg font-cabin text-base hover:bg-explore-green/5 transition-colors"
            disabled={loading}
          >
            Continue with Apple
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-6">
            <p className="text-gray-600 font-cabin text-base">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-explore-green font-semibold hover:text-explore-green/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
