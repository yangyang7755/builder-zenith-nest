import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, MessageCircle } from 'lucide-react';

export default function AuthLanding() {
  return (
    <div className="mobile-container min-h-screen bg-gradient-to-br from-explore-green to-blue-600 flex flex-col">
      {/* Status Bar */}
      <div className="mobile-status-bar bg-transparent text-white">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-white rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="white" strokeWidth="1" fill="none" />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="white" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-cabin">WildPals</h1>
          <p className="text-xl opacity-90 font-cabin">Find your adventure tribe</p>
        </div>

        {/* Features */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold font-cabin">Join Activities</h3>
              <p className="text-sm opacity-80 font-cabin">Connect with like-minded adventurers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold font-cabin">Discover Activities</h3>
              <p className="text-sm opacity-80 font-cabin">Find exciting activities near you</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold font-cabin">Chat & Connect</h3>
              <p className="text-sm opacity-80 font-cabin">Message other participants</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Link
            to="/auth/signup"
            className="w-full bg-white text-explore-green px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg font-cabin"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            to="/auth/login"
            className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold text-lg border border-white/30 transition-all hover:bg-white/30 font-cabin"
          >
            Sign In
          </Link>
        </div>

        {/* Terms */}
        <div className="mt-8 text-xs opacity-70 font-cabin">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
