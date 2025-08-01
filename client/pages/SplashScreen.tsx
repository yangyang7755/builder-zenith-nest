import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative flex flex-col justify-center items-center">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 mb-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F9e47fe83fd834e79a57361f8a278d9a9?format=webp&width=800"
            alt="Wildpals Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-black font-cabin">Wildpals</h1>
      </div>
    </div>
  );
}
