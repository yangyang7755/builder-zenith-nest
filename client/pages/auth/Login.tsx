import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message || 'Failed to sign in');
      } else if (user) {
        // Successful login - redirect to main app
        navigate('/explore');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="mobile-container min-h-screen bg-white">
      {/* Status Bar */}
      <div className="mobile-status-bar">
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
      <div className="mobile-header">
        <div className="flex items-center">
          <button onClick={() => navigate('/auth')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <div>
            <h1 className="text-mobile-h3 text-black">Welcome Back</h1>
            <p className="text-mobile-caption text-gray-500">Sign in to your account</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-cabin">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-cabin">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="search-input-mobile"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-cabin">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="search-input-mobile pr-12"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-explore-green hover:text-green-600 font-cabin"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-mobile w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Credentials for Testing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2 font-cabin">Demo Credentials</h3>
            <p className="text-xs text-blue-700 mb-2 font-cabin">
              Use these credentials to test the app:
            </p>
            <div className="text-xs text-blue-700 font-mono">
              <p>Email: demo@wildpals.com</p>
              <p>Password: demo123456</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'demo@wildpals.com',
                  password: 'demo123456'
                });
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-cabin underline"
            >
              Fill demo credentials
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 font-cabin">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-explore-green font-semibold hover:text-green-600">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
