import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProfileOnboarding from "@/components/ProfileOnboarding";
import EnhancedProfile from "@/components/EnhancedProfile";
import {
  enhancedMaddieWeiProfile,
  enhancedAlexJohnsonProfile,
  enhancedSarahChenProfile,
  EnhancedProfileData,
  getAllEnhancedProfiles
} from "@/data/enhancedDemoProfiles";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Users,
  Settings,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Target,
  Heart,
  Award
} from "lucide-react";

export default function ProfileDemo() {
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<EnhancedProfileData>(enhancedMaddieWeiProfile);
  const [activeTab, setActiveTab] = useState("features");

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    setShowOnboarding(false);
    toast({
      title: "Profile Setup Complete!",
      description: "Your profile has been created successfully. Welcome to the community!",
    });
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    toast({
      title: "Onboarding Skipped",
      description: "You can complete your profile setup anytime from settings.",
    });
  };

  const profiles = getAllEnhancedProfiles();

  const featureHighlights = [
    {
      icon: User,
      title: "Enhanced Profile Setup",
      description: "Multi-step onboarding process that captures detailed user preferences, skills, and goals for better activity matching.",
      features: ["Personal info & photo upload", "Interests & skill levels", "Activity preferences", "Safety information", "Privacy settings"]
    },
    {
      icon: Target,
      title: "Skills & Interests Tracking",
      description: "Detailed skill level tracking for different activities with visual progress indicators and interest-based matching.",
      features: ["Skill level ratings (Beginner to Expert)", "Activity-specific interests", "Fitness goals tracking", "Equipment inventory", "Preferred activity times"]
    },
    {
      icon: Award,
      title: "Achievements & Badges",
      description: "Gamified achievement system that rewards users for participation, leadership, and community contribution.",
      features: ["Activity milestones", "Social achievements", "Skill progression badges", "Consistency streaks", "Leadership recognition"]
    },
    {
      icon: Heart,
      title: "Social Features",
      description: "Enhanced social connectivity with privacy controls, messaging, and community building tools.",
      features: ["Connection system", "Private messaging", "Profile visibility controls", "Activity reviews & ratings", "Community recommendations"]
    },
    {
      icon: Settings,
      title: "Privacy & Safety",
      description: "Comprehensive privacy controls and safety features for secure activity participation.",
      features: ["Granular privacy settings", "Emergency contact info", "Medical conditions tracking", "Activity visibility controls", "Safe meetup guidelines"]
    },
    {
      icon: Star,
      title: "Analytics & Insights",
      description: "Personal analytics dashboard showing activity participation, skill development, and community engagement.",
      features: ["Activity statistics", "Skill progression tracking", "Social engagement metrics", "Goal completion rates", "Personal insights"]
    }
  ];

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfileOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Profile System</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience our comprehensive profile system with multi-step onboarding, detailed skill tracking, 
          achievements, and enhanced social features designed for active communities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding Demo</TabsTrigger>
          <TabsTrigger value="profiles">Profile Examples</TabsTrigger>
        </TabsList>

        {/* Features Overview */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            {featureHighlights.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((feat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {feat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to Experience It?</h3>
                <p className="text-gray-600 mb-4">
                  Try our enhanced profile system with guided onboarding and see how it creates better connections in your community.
                </p>
                <Button 
                  onClick={() => setActiveTab("onboarding")} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Try Onboarding Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Demo */}
        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6" />
                Profile Onboarding Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">What You'll Experience:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 6-step guided setup process</li>
                    <li>• Personal information and photo upload</li>
                    <li>• Interest selection and skill level assessment</li>
                    <li>• Activity preferences and goals</li>
                    <li>• Safety information and emergency contacts</li>
                    <li>• Privacy settings and social preferences</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => setShowOnboarding(true)}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Onboarding Demo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete demo process (can be skipped at any time)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Progressive Disclosure</h4>
                    <p className="text-sm text-gray-600">
                      Information is collected step-by-step to avoid overwhelming users while ensuring completeness.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Smart Defaults</h4>
                    <p className="text-sm text-gray-600">
                      Intelligent suggestions and pre-filled options based on user input and common preferences.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Examples */}
        <TabsContent value="profiles" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <p className="text-sm text-gray-600 mr-4">Choose a profile to explore:</p>
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                variant={selectedProfile.id === profile.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProfile(profile)}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {profile.full_name}
              </Button>
            ))}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Interactive Profile Demo</h4>
                <p className="text-sm text-yellow-800">
                  Explore different user profiles to see how various activity interests, skill levels, 
                  and achievements are displayed. Each profile represents a different user persona with 
                  unique preferences and community engagement patterns.
                </p>
              </div>
            </div>
          </div>

          <EnhancedProfile
            profileData={selectedProfile}
            isOwnProfile={false}
            onMessage={() => toast({ 
              title: "Demo Mode", 
              description: "This would open a messaging interface in the real app." 
            })}
            onConnect={() => toast({ 
              title: "Demo Mode", 
              description: "This would send a connection request in the real app." 
            })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
