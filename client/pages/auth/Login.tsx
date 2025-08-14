import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { resendConfirmation } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    setShowEmailConfirmation(false);

    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        // Check for email confirmation errors
        if (error.message?.includes('Email not confirmed') ||
            error.message?.includes('email_not_confirmed') ||
            error.message?.includes('confirmation')) {
          setShowEmailConfirmation(true);
          setError('Please check your email and click the confirmation link before logging in.');
        } else {
          setError(error.message || 'Failed to sign in');
        }
      } else if (user) {
        // Successful login - check if user needs onboarding
        if (isOnboardingComplete) {
          navigate("/explore");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        setError(error.message || 'Failed to resend confirmation email');
      } else {
        setResendSuccess(true);
        setError('');
      }
    } catch (err) {
      setError('An unexpected error occurred while resending confirmation');
      console.error('Resend confirmation error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      <div className="flex flex-col justify-center items-center px-7 py-16 min-h-screen">
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

        {/* Error Message */}
        {error && (
          <div className={`w-full max-w-sm mb-4 p-3 rounded font-cabin text-sm ${
            showEmailConfirmation
              ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
            {showEmailConfirmation && (
              <div className="mt-2 text-xs">
                <p>If you haven't received the confirmation email:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Check your spam/junk folder</li>
                  <li>Wait a few minutes and check again</li>
                  <li>Click the button below to resend</li>
                </ul>
                <button
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || !email}
                  className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs disabled:opacity-50 hover:bg-yellow-700"
                >
                  {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Message for Resend */}
        {resendSuccess && (
          <div className="w-full max-w-sm mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded font-cabin text-sm">
            Confirmation email sent! Please check your inbox and click the confirmation link.
          </div>
        )}

        {/* Form */}
        <div className="w-full max-w-sm space-y-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black opacity-55 text-base font-cabin"
            >
              Show
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-explore-green text-white py-3 px-6 rounded-lg font-cabin text-base mt-6 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Forgot Password */}
          <div className="text-center pt-4">
            <button className="text-black font-cabin text-base">
              Forgot your password?
            </button>
          </div>

          {/* Divider */}
          <div className="text-center py-4">
            <span className="text-gray-400 font-cabin text-base">or</span>
          </div>

          {/* Continue with Apple */}
          <button className="w-full border-2 border-explore-green bg-white text-explore-green py-3 px-6 rounded-lg font-cabin text-base">
            Continue with Apple
          </button>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-700 mb-2 font-cabin">Demo: demo@wildpals.com / demo123456</p>
            <button
              onClick={() => {
                setEmail('demo@wildpals.com');
                setPassword('demo123456');
              }}
              className="text-xs text-blue-600 underline font-cabin"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
