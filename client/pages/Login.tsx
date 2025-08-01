import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Handle login logic here
    // For now, just navigate to explore
    navigate("/explore");
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
            className="w-full bg-explore-green text-white py-3 px-6 rounded-lg font-cabin text-base mt-6"
          >
            Log in
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
        </div>
      </div>
    </div>
  );
}
