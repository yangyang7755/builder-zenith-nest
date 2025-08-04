import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import ImageUpload from "@/components/ImageUpload";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Users,
  Calendar,
  Clock,
  Plus,
  X,
  Camera,
  Target,
  Info
} from "lucide-react";

interface ClubFormData {
  name: string;
  description: string;
  type: string;
  location: string;
  profileImage: string;
  coverImage: string;
  website: string;
  contactEmail: string;
  isPrivate: boolean;
  membershipFee: string;
  skillLevel: string[];
  regularActivities: RegularActivity[];
  clubRules: string[];
}

interface RegularActivity {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  time: string;
  location: string;
  skillLevel: string;
  maxParticipants: number;
}

const CLUB_TYPES = [
  { value: "cycling", label: "🚴‍♂️ Cycling", icon: "🚴‍♂️" },
  { value: "running", label: "🏃‍♂️ Running", icon: "🏃‍♂️" },
  { value: "climbing", label: "🧗‍♀️ Climbing", icon: "🧗‍♀️" },
  { value: "hiking", label: "🥾 Hiking", icon: "🥾" },
  { value: "swimming", label: "🏊‍♂️ Swimming", icon: "🏊‍♂️" },
  { value: "tennis", label: "🎾 Tennis", icon: "🎾" },
  { value: "football", label: "⚽ Football", icon: "⚽" },
  { value: "basketball", label: "🏀 Basketball", icon: "🏀" },
  { value: "yoga", label: "🧘‍♀️ Yoga", icon: "🧘‍♀️" },
  { value: "fitness", label: "💪 Fitness", icon: "💪" },
  { value: "other", label: "🏃‍♂️ Other Sports", icon: "🏃‍♂️" }
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreateClub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClubFormData>({
    name: "",
    description: "",
    type: "",
    location: "",
    profileImage: "",
    coverImage: "",
    website: "",
    contactEmail: "",
    isPrivate: false,
    membershipFee: "",
    skillLevel: [],
    regularActivities: [],
    clubRules: []
  });

  const [newActivity, setNewActivity] = useState<RegularActivity>({
    id: "",
    name: "",
    description: "",
    dayOfWeek: "",
    time: "",
    location: "",
    skillLevel: "",
    maxParticipants: 20
  });

  const [newRule, setNewRule] = useState("");

  const updateFormData = (field: keyof ClubFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkillLevel = (level: string) => {
    const currentLevels = formData.skillLevel;
    const updatedLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    updateFormData("skillLevel", updatedLevels);
  };

  const addRegularActivity = () => {
    if (newActivity.name && newActivity.dayOfWeek && newActivity.time) {
      const activity = { ...newActivity, id: Date.now().toString() };
      updateFormData("regularActivities", [...formData.regularActivities, activity]);
      setNewActivity({
        id: "",
        name: "",
        description: "",
        dayOfWeek: "",
        time: "",
        location: "",
        skillLevel: "",
        maxParticipants: 20
      });
    }
  };

  const removeActivity = (id: string) => {
    updateFormData("regularActivities", formData.regularActivities.filter(a => a.id !== id));
  };

  const addClubRule = () => {
    if (newRule.trim()) {
      updateFormData("clubRules", [...formData.clubRules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    updateFormData("clubRules", formData.clubRules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically submit to your backend API
      console.log("Creating club with data:", formData);
      
      toast({
        title: "Club Created Successfully! 🎉",
        description: `${formData.name} has been created. You can now start inviting members!`,
      });
      
      // Navigate to the new club's management page
      navigate(`/club/manage/${formData.name.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      toast({
        title: "Error Creating Club",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getSelectedClubType = () => {
    return CLUB_TYPES.find(type => type.value === formData.type);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">Basic Information</h2>
              <p className="text-gray-600 font-cabin">Let's start with the basics of your club</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-cabin">Club Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="e.g., London Cycling Club"
                  className="font-cabin"
                />
              </div>

              <div>
                <Label htmlFor="type" className="font-cabin">Activity Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                  <SelectTrigger className="font-cabin">
                    <SelectValue placeholder="Choose your main activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLUB_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="font-cabin">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location" className="font-cabin">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    placeholder="City, Country"
                    className="pl-10 font-cabin"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-cabin">Club Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Describe your club's mission, values, and what makes it special..."
                  rows={4}
                  className="font-cabin"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">Visual Identity</h2>
              <p className="text-gray-600 font-cabin">Add photos to make your club stand out</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-cabin mb-3 block">Club Logo/Profile Picture</Label>
                <ImageUpload
                  currentImage={formData.profileImage}
                  onImageChange={(url) => updateFormData("profileImage", url)}
                  variant="avatar"
                  size="lg"
                  placeholder="Upload Club Logo"
                />
              </div>

              <div>
                <Label className="font-cabin mb-3 block">Cover Photo</Label>
                <ImageUpload
                  currentImage={formData.coverImage}
                  onImageChange={(url) => updateFormData("coverImage", url)}
                  variant="cover"
                  size="lg"
                  placeholder="Upload Cover Photo"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 font-cabin mb-1">Photo Tips</h4>
                    <ul className="text-sm text-blue-800 font-cabin space-y-1">
                      <li>• Use high-quality images (min 400x400px for logo)</li>
                      <li>• Logo should clearly represent your club</li>
                      <li>• Cover photo could show your activity or location</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">Club Settings</h2>
              <p className="text-gray-600 font-cabin">Configure how your club operates</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-cabin mb-3 block">Skill Levels Welcome</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SKILL_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={formData.skillLevel.includes(level)}
                        onCheckedChange={() => toggleSkillLevel(level)}
                      />
                      <Label htmlFor={level} className="font-cabin text-sm">{level}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => updateFormData("isPrivate", checked)}
                />
                <Label htmlFor="private" className="font-cabin">Private Club (Members by invitation only)</Label>
              </div>

              <div>
                <Label htmlFor="membershipFee" className="font-cabin">Membership Fee (Optional)</Label>
                <Input
                  id="membershipFee"
                  value={formData.membershipFee}
                  onChange={(e) => updateFormData("membershipFee", e.target.value)}
                  placeholder="e.g., £20/month or £100/year"
                  className="font-cabin"
                />
              </div>

              <div>
                <Label htmlFor="website" className="font-cabin">Website (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateFormData("website", e.target.value)}
                    placeholder="https://yourclub.com"
                    className="pl-10 font-cabin"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail" className="font-cabin">Contact Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData("contactEmail", e.target.value)}
                    placeholder="contact@yourclub.com"
                    className="pl-10 font-cabin"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">Activities & Rules</h2>
              <p className="text-gray-600 font-cabin">Set up regular activities and club guidelines</p>
            </div>

            <div className="space-y-6">
              {/* Regular Activities */}
              <div>
                <Label className="font-cabin mb-3 block">Regular Weekly Activities</Label>
                
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-cabin flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add Regular Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Activity name"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                        className="font-cabin"
                      />
                      <Select
                        value={newActivity.dayOfWeek}
                        onValueChange={(value) => setNewActivity({...newActivity, dayOfWeek: value})}
                      >
                        <SelectTrigger className="font-cabin">
                          <SelectValue placeholder="Day of week" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day} value={day} className="font-cabin">{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                        className="font-cabin"
                      />
                      <Input
                        placeholder="Max participants"
                        type="number"
                        value={newActivity.maxParticipants}
                        onChange={(e) => setNewActivity({...newActivity, maxParticipants: parseInt(e.target.value) || 20})}
                        className="font-cabin"
                      />
                    </div>

                    <Input
                      placeholder="Location (optional)"
                      value={newActivity.location}
                      onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                      className="font-cabin"
                    />

                    <Textarea
                      placeholder="Activity description (optional)"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      rows={2}
                      className="font-cabin"
                    />

                    <Button onClick={addRegularActivity} className="w-full font-cabin">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </CardContent>
                </Card>

                {formData.regularActivities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium font-cabin">Scheduled Activities:</h4>
                    {formData.regularActivities.map(activity => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium font-cabin">{activity.name}</div>
                          <div className="text-sm text-gray-600 font-cabin">
                            {activity.dayOfWeek}s at {activity.time}
                            {activity.location && ` • ${activity.location}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Club Rules */}
              <div>
                <Label className="font-cabin mb-3 block">Club Rules (Optional)</Label>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a club rule..."
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    className="font-cabin"
                    onKeyPress={(e) => e.key === 'Enter' && addClubRule()}
                  />
                  <Button onClick={addClubRule} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.clubRules.length > 0 && (
                  <div className="space-y-2">
                    {formData.clubRules.map((rule, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-cabin">{index + 1}. {rule}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.type && formData.location && formData.description;
      case 2:
        return true; // Photos are optional
      case 3:
        return formData.contactEmail && formData.skillLevel.length > 0;
      case 4:
        return true; // Activities and rules are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Header */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Create Club</h1>
        <div className="w-6" />
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-cabin text-gray-600">Step {currentStep} of 4</span>
          <span className="text-sm font-cabin text-gray-600">{Math.round((currentStep / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-explore-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="flex gap-3 p-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1 font-cabin"
            >
              Previous
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className="flex-1 bg-explore-green text-white font-cabin hover:bg-green-600"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete()}
              className="flex-1 bg-explore-green text-white font-cabin hover:bg-green-600"
            >
              Create Club
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
