import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Target,
  Award,
  Users,
  Settings,
  Heart,
  Clock,
  Bike,
  Mountain,
  Activity,
  Star
} from "lucide-react";

interface OnboardingData {
  // Basic Info
  full_name: string;
  university: string;
  bio: string;
  profile_image: string;
  location: string;
  age_range: string;
  
  // Interests & Skills
  interests: string[];
  skill_levels: Record<string, number>;
  equipment: string[];
  preferred_times: string[];
  
  // Goals & Preferences
  fitness_goals: string[];
  group_size_preference: string;
  activity_style: string;
  travel_distance: number;
  budget_range: string;
  
  // Safety & Emergency
  emergency_contact: string;
  medical_conditions: string;
  dietary_restrictions: string[];
  
  // Social Preferences
  visibility: string;
  show_achievements: boolean;
  allow_messages: boolean;
}

const STEPS = [
  { id: "basic", title: "Basic Info", icon: User },
  { id: "interests", title: "Interests", icon: Heart },
  { id: "skills", title: "Skills", icon: Target },
  { id: "preferences", title: "Preferences", icon: Settings },
  { id: "safety", title: "Safety", icon: Award },
  { id: "social", title: "Social", icon: Users },
];

const ACTIVITY_TYPES = [
  "cycling", "running", "hiking", "climbing", "swimming", "football", 
  "tennis", "basketball", "yoga", "pilates", "dancing", "martial_arts"
];

const FITNESS_GOALS = [
  "Weight Loss", "Muscle Gain", "Endurance", "Flexibility", 
  "Social Connection", "Stress Relief", "Competition", "General Fitness"
];

const PREFERRED_TIMES = [
  "Early Morning (6-9 AM)", "Morning (9-12 PM)", "Afternoon (12-5 PM)", 
  "Evening (5-8 PM)", "Night (8-11 PM)", "Weekends Only", "Flexible"
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian", "Vegan", "Gluten Free", "Dairy Free", "Nut Allergy", 
  "Halal", "Kosher", "Low Carb", "Keto", "None"
];

interface ProfileOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  initialData?: Partial<OnboardingData>;
}

export default function ProfileOnboarding({ 
  onComplete, 
  onSkip,
  initialData = {} 
}: ProfileOnboardingProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    full_name: "",
    university: "",
    bio: "",
    profile_image: "",
    location: "",
    age_range: "",
    interests: [],
    skill_levels: {},
    equipment: [],
    preferred_times: [],
    fitness_goals: [],
    group_size_preference: "",
    activity_style: "",
    travel_distance: 10,
    budget_range: "",
    emergency_contact: "",
    medical_conditions: "",
    dietary_restrictions: [],
    visibility: "public",
    show_achievements: true,
    allow_messages: true,
    ...initialData
  });

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    const currentArray = data[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateData(field, newArray);
  };

  const updateSkillLevel = (activity: string, level: number) => {
    updateData("skill_levels", { ...data.skill_levels, [activity]: level });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(data);
    toast({
      title: "Profile Setup Complete!",
      description: "Welcome to the community! Start exploring activities and clubs.",
    });
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Let's get to know you!</h2>
              <p className="text-gray-600">Tell us about yourself to get started</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <ImageUpload
                currentImage={data.profile_image}
                onImageChange={(url) => updateData("profile_image", url)}
                variant="avatar"
                size="lg"
                placeholder="Add Profile Photo"
              />
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={data.full_name}
                  onChange={(e) => updateData("full_name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="university">University/Organization</Label>
                <Input
                  id="university"
                  value={data.university}
                  onChange={(e) => updateData("university", e.target.value)}
                  placeholder="e.g., Oxford University"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => updateData("location", e.target.value)}
                  placeholder="e.g., Oxford, UK"
                />
              </div>

              <div>
                <Label htmlFor="age_range">Age Range</Label>
                <Select value={data.age_range} onValueChange={(value) => updateData("age_range", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => updateData("bio", e.target.value)}
                  placeholder="Tell others about yourself, your interests, and what you're looking for..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">What are you interested in?</h2>
              <p className="text-gray-600">Select all activities that interest you</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACTIVITY_TYPES.map(activity => (
                <Button
                  key={activity}
                  variant={data.interests.includes(activity) ? "default" : "outline"}
                  onClick={() => toggleArrayItem("interests", activity)}
                  className="justify-start h-auto p-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm capitalize">{activity.replace('_', ' ')}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <Label>Preferred Activity Times</Label>
              <div className="grid gap-2">
                {PREFERRED_TIMES.map(time => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={data.preferred_times.includes(time)}
                      onCheckedChange={() => toggleArrayItem("preferred_times", time)}
                    />
                    <Label htmlFor={time} className="text-sm">{time}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">What's your experience level?</h2>
              <p className="text-gray-600">Rate your skill level in activities you're interested in</p>
            </div>

            <div className="space-y-6">
              {data.interests.map(activity => (
                <div key={activity} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="capitalize font-medium">{activity.replace('_', ' ')}</Label>
                    <Badge variant="outline">
                      {data.skill_levels[activity] === 1 ? "Beginner" : 
                       data.skill_levels[activity] === 2 ? "Intermediate" : 
                       data.skill_levels[activity] === 3 ? "Advanced" : 
                       data.skill_levels[activity] === 4 ? "Expert" : "Not set"}
                    </Badge>
                  </div>
                  <Slider
                    value={[data.skill_levels[activity] || 1]}
                    onValueChange={(value) => updateSkillLevel(activity, value[0])}
                    max={4}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label>Fitness Goals</Label>
              <div className="grid grid-cols-2 gap-2">
                {FITNESS_GOALS.map(goal => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={data.fitness_goals.includes(goal)}
                      onCheckedChange={() => toggleArrayItem("fitness_goals", goal)}
                    />
                    <Label htmlFor={goal} className="text-sm">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Activity Preferences</h2>
              <p className="text-gray-600">Help us match you with the right activities</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Preferred Group Size</Label>
                <RadioGroup 
                  value={data.group_size_preference} 
                  onValueChange={(value) => updateData("group_size_preference", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="solo" />
                    <Label htmlFor="solo">Solo activities</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small groups (2-5 people)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium groups (6-15 people)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">Large groups (15+ people)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Activity Style</Label>
                <RadioGroup 
                  value={data.activity_style} 
                  onValueChange={(value) => updateData("activity_style", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual & Social</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="structured" id="structured" />
                    <Label htmlFor="structured">Structured Training</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="competitive" id="competitive" />
                    <Label htmlFor="competitive">Competitive</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Willing to travel for activities</Label>
                <div className="mt-2 mb-4">
                  <Slider
                    value={[data.travel_distance]}
                    onValueChange={(value) => updateData("travel_distance", value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span className="font-medium">{data.travel_distance} km</span>
                    <span>50+ km</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Budget Range for Paid Activities</Label>
                <Select value={data.budget_range} onValueChange={(value) => updateData("budget_range", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free activities only</SelectItem>
                    <SelectItem value="low">£0-10 per activity</SelectItem>
                    <SelectItem value="medium">£10-25 per activity</SelectItem>
                    <SelectItem value="high">£25-50 per activity</SelectItem>
                    <SelectItem value="premium">£50+ per activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "safety":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Safety Information</h2>
              <p className="text-gray-600">Help keep you safe during activities</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={data.emergency_contact}
                  onChange={(e) => updateData("emergency_contact", e.target.value)}
                  placeholder="Name and phone number"
                />
              </div>

              <div>
                <Label htmlFor="medical_conditions">Medical Conditions/Allergies</Label>
                <Textarea
                  id="medical_conditions"
                  value={data.medical_conditions}
                  onChange={(e) => updateData("medical_conditions", e.target.value)}
                  placeholder="Any medical conditions, allergies, or medications activity organizers should know about (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DIETARY_RESTRICTIONS.map(restriction => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={data.dietary_restrictions.includes(restriction)}
                        onCheckedChange={() => toggleArrayItem("dietary_restrictions", restriction)}
                      />
                      <Label htmlFor={restriction} className="text-sm">{restriction}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Privacy Note:</strong> This information is only shared with activity organizers 
                when you join their activities and is used for safety purposes only.
              </p>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Social Settings</h2>
              <p className="text-gray-600">Control how others can interact with you</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Profile Visibility</Label>
                <RadioGroup 
                  value={data.visibility} 
                  onValueChange={(value) => updateData("visibility", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public - Anyone can see your profile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="members" id="members" />
                    <Label htmlFor="members">Members only - Only app members can see your profile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="connections" id="connections" />
                    <Label htmlFor="connections">Connections only - Only people you've connected with</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show achievements and badges</Label>
                    <p className="text-sm text-gray-500">Display your activity milestones on your profile</p>
                  </div>
                  <Checkbox
                    checked={data.show_achievements}
                    onCheckedChange={(checked) => updateData("show_achievements", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow direct messages</Label>
                    <p className="text-sm text-gray-500">Let other members send you messages</p>
                  </div>
                  <Checkbox
                    checked={data.allow_messages}
                    onCheckedChange={(checked) => updateData("allow_messages", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">🎉 You're all set!</h4>
              <p className="text-sm text-green-700">
                Your profile is ready! You can always update these settings later in your profile.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Profile Setup</h1>
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="text-gray-500">
              Skip for now
            </Button>
          )}
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button onClick={nextStep}>
          {currentStep === STEPS.length - 1 ? "Complete Setup" : "Next"}
          {currentStep < STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
