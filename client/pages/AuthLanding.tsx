import { Link } from "react-router-dom";

export default function AuthLanding() {
  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Skip Button */}
      <div className="absolute top-4 right-4">
        <Link
          to="/explore"
          className="text-sm text-gray-500 underline font-cabin"
        >
          Skip
        </Link>
      </div>

      <div className="flex flex-col justify-center items-center px-9 py-16 min-h-screen">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 mb-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F9e47fe83fd834e79a57361f8a278d9a9?format=webp&width=800"
              alt="Wildpals Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Get Started Text */}
        <h1 className="text-2xl text-black text-center font-cabin mb-12">
          Get started...
        </h1>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {/* Sign up with Email Button */}
          <Link
            to="/signup"
            className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-center font-cabin text-base block"
          >
            Sign up with Email
          </Link>

          {/* Continue with Apple Button */}
          <Link
            to="/enhanced-login"
            className="w-full border-2 border-explore-green bg-white text-explore-green py-3 px-6 rounded-lg font-cabin text-base block text-center"
          >
            Continue with Apple
          </Link>

          {/* Login Link */}
          <div className="text-center pt-4">
            <span className="text-black font-cabin text-base">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-black font-bold underline font-cabin text-base"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Demo Links */}
        <div className="mt-8 w-full max-w-sm space-y-2">
          <Link
            to="/profile/demo"
            className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-center font-cabin text-sm block border border-blue-200"
          >
            📋 View Profile Demo & Onboarding Tutorial
          </Link>
          <Link
            to="/enhanced-login"
            className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg text-center font-cabin text-sm block border border-purple-200"
          >
            🍎 Test Apple Sign-in & Email Verification
          </Link>
        </div>

        {/* Bottom Logo */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black font-cabin">Wildpals</h2>
        </div>
      </div>
    </div>
  );
}
