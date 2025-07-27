import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import AuthLanding from "./pages/AuthLanding";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import ActivityDetails from "./pages/ActivityDetails";
import CreateActivity from "./pages/CreateActivity";
import CreateCycling from "./pages/CreateCycling";
import CreateClimbing from "./pages/CreateClimbing";
import NotFound from "./pages/NotFound";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ActivitiesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<AuthLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/explore" element={<Index />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/create" element={<CreateActivity />} />
            <Route path="/create/cycling" element={<CreateCycling />} />
            <Route path="/create/climbing" element={<CreateClimbing />} />
            <Route
              path="/activity/westway-womens-climb"
              element={<ActivityDetails />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ActivitiesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;

// Check if root already exists to prevent multiple createRoot calls
if (!rootElement._reactRoot) {
  const root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
  root.render(<App />);
} else {
  (rootElement as any)._reactRoot.render(<App />);
}
