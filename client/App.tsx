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
import CreateRunning from "./pages/CreateRunning";
import CreateHiking from "./pages/CreateHiking";
import CreateSkiing from "./pages/CreateSkiing";
import CreateSurfing from "./pages/CreateSurfing";
import CreateTennis from "./pages/CreateTennis";
import CarShareDetails from "./pages/CarShareDetails";
import ClubChatOxford from "./pages/ClubChatOxford";
import ClubChatWestway from "./pages/ClubChatWestway";
import ClubChatRichmond from "./pages/ClubChatRichmond";
import ClubChatUCLMC from "./pages/ClubChatUCLMC";
import PartnerDetails from "./pages/PartnerDetails";
import Chat from "./pages/Chat";
import IndividualChat from "./pages/IndividualChat";
import ClubWestway from "./pages/ClubWestway";
import ClubOxford from "./pages/ClubOxford";
import ClubRapha from "./pages/ClubRapha";
import ClubVauxwall from "./pages/ClubVauxwall";
import ClubRichmond from "./pages/ClubRichmond";
import ClubThames from "./pages/ClubThames";
import CoachHolly from "./pages/CoachHolly";
import ProfileCoachHolly from "./pages/ProfileCoachHolly";
import ProfileDanSmith from "./pages/ProfileDanSmith";
import ProfileEdit from "./pages/ProfileEdit";
import Onboarding from "./pages/Onboarding";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Followers from "./pages/Followers";
import Following from "./pages/Following";
import NotFound from "./pages/NotFound";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";
import { ChatProvider } from "./contexts/ChatContext";
import { SavedActivitiesProvider } from "./contexts/SavedActivitiesContext";
import { ActivityDraftProvider } from "./contexts/ActivityDraftContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ClubProvider } from "./contexts/ClubContext";
import ToastContainer from "./components/ToastNotification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <ClubProvider>
          <OnboardingProvider>
            <ActivitiesProvider>
              <SavedActivitiesProvider>
                <ActivityDraftProvider>
                  <ChatProvider>
                  <Toaster />
                  <Sonner />
                  <ToastContainer />
                  <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/auth" element={<AuthLanding />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/explore" element={<Index />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/create" element={<CreateActivity />} />
                    <Route path="/create/cycling" element={<CreateCycling />} />
                    <Route path="/create/climbing" element={<CreateClimbing />} />
                    <Route path="/create/running" element={<CreateRunning />} />
                    <Route path="/create/hiking" element={<CreateHiking />} />
                    <Route path="/create/skiing" element={<CreateSkiing />} />
                    <Route path="/create/surfing" element={<CreateSurfing />} />
                    <Route path="/create/tennis" element={<CreateTennis />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/chat/:userId" element={<IndividualChat />} />
                    <Route path="/club/westway" element={<ClubWestway />} />
                    <Route path="/club/oxford-cycling" element={<ClubOxford />} />
                    <Route path="/club/rapha-cycling" element={<ClubRapha />} />
                    <Route
                      path="/club/vauxwall-climbing"
                      element={<ClubVauxwall />}
                    />
                    <Route
                      path="/club/richmond-runners"
                      element={<ClubRichmond />}
                    />
                    <Route
                      path="/club/thames-cyclists"
                      element={<ClubThames />}
                    />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<ProfileEdit />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/followers" element={<Followers />} />
                    <Route path="/following" element={<Following />} />
                    <Route
                      path="/activity/:activityId"
                      element={<ActivityDetails />}
                    />
                    <Route
                      path="/carshare/:carShareId"
                      element={<CarShareDetails />}
                    />
                    <Route
                      path="/club-chat/oxford"
                      element={<ClubChatOxford />}
                    />
                    <Route
                      path="/club-chat/westway"
                      element={<ClubChatWestway />}
                    />
                    <Route
                      path="/club-chat/richmond"
                      element={<ClubChatRichmond />}
                    />
                    <Route
                      path="/club-chat/uclmc"
                      element={<ClubChatUCLMC />}
                    />
                    <Route
                      path="/partner/:partnerId"
                      element={<PartnerDetails />}
                    />
                    <Route path="/profile/coach-holly" element={<ProfileCoachHolly />} />
                    <Route path="/profile/dan-smith" element={<ProfileDanSmith />} />
                    <Route path="/profile/coach-holly-old" element={<CoachHolly />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                    </BrowserRouter>
                  </ChatProvider>
                </ActivityDraftProvider>
              </SavedActivitiesProvider>
            </ActivitiesProvider>
          </OnboardingProvider>
        </ClubProvider>
      </ToastProvider>
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
