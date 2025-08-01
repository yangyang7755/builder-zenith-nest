import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Award,
  Users,
  TrendingUp,
  Star,
  MessageCircle,
  Settings,
  Eye,
  Heart,
  Target,
  Trophy,
  Activity,
  Clock,
  Navigation,
  Shield
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: "activities" | "social" | "skills" | "consistency";
}

interface ProfileStats {
  activitiesOrganized: number;
  activitiesJoined: number;
  clubsJoined: number;
  totalConnections: number;
  achievementsEarned: number;
  currentStreak: number;
  totalDistance: number;
  averageRating: number;
}

interface EnhancedProfileData {
  // Basic info (existing)
  full_name: string;
  university: string;
  bio: string;
  profile_image: string;
  
  // Enhanced data
  location: string;
  age_range: string;
  interests: string[];
  skill_levels: Record<string, number>;
  fitness_goals: string[];
  preferred_times: string[];
  group_size_preference: string;
  activity_style: string;
  achievements: Achievement[];
  stats: ProfileStats;
  visibility: string;
  show_achievements: boolean;
  allow_messages: boolean;
  verified: boolean;
  member_since: string;
}

interface EnhancedProfileProps {
  profileData?: EnhancedProfileData;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
  onConnect?: () => void;
}

export default function EnhancedProfile({
  profileData,
  isOwnProfile = false,
  onEdit,
  onMessage,
  onConnect
}: EnhancedProfileProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 1: return "Beginner";
      case 2: return "Intermediate";
      case 3: return "Advanced";
      case 4: return "Expert";
      default: return "Not set";
    }
  };

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-purple-100 text-purple-800";
      case 4: return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderAchievementBadge = (achievement: Achievement) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      target: Target,
      activity: Activity,
      users: Users,
      heart: Heart
    };
    
    const Icon = icons[achievement.icon as keyof typeof icons] || Award;
    
    return (
      <div
        key={achievement.id}
        className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
          <Icon className="h-4 w-4 text-yellow-600" />
        </div>
        <span className="text-xs font-medium text-center">{achievement.title}</span>
        <span className="text-xs text-gray-500 mt-1">
          {new Date(achievement.earned_at).toLocaleDateString()}
        </span>
      </div>
    );
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={profileData.profile_image} alt={profileData.full_name} />
                  <AvatarFallback className="text-2xl">
                    {profileData.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profileData.verified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {!isOwnProfile && (
                <div className="flex gap-2 mt-4">
                  {onMessage && profileData.allow_messages && (
                    <Button size="sm" variant="outline" onClick={onMessage}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                  {onConnect && (
                    <Button size="sm" onClick={onConnect}>
                      <Users className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                  {profileData.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-gray-600">
                  {profileData.university && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.university}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(profileData.member_since).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {profileData.bio && (
                <p className="text-gray-700">{profileData.bio}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{profileData.stats.activitiesJoined}</div>
                  <div className="text-xs text-gray-500">Activities Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{profileData.stats.clubsJoined}</div>
                  <div className="text-xs text-gray-500">Clubs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{profileData.stats.totalConnections}</div>
                  <div className="text-xs text-gray-500">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">{profileData.stats.achievementsEarned}</div>
                  <div className="text-xs text-gray-500">Achievements</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={onEdit} variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Interests & Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Interests & Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="capitalize">
                        {interest.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Skill Levels</h4>
                  <div className="space-y-2">
                    {Object.entries(profileData.skill_levels).slice(0, 4).map(([activity, level]) => (
                      <div key={activity} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{activity.replace('_', ' ')}</span>
                        <Badge className={getSkillLevelColor(level)}>
                          {getSkillLevelText(level)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Fitness Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.fitness_goals.map(goal => (
                      <Badge key={goal} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Group Size</span>
                    <span className="capitalize font-medium">{profileData.group_size_preference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Activity Style</span>
                    <span className="capitalize font-medium">{profileData.activity_style}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preferred Times</span>
                    <span className="font-medium">{profileData.preferred_times.length} selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          {profileData.show_achievements && profileData.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {profileData.achievements.slice(0, 6).map(renderAchievementBadge)}
                </div>
                {profileData.achievements.length > 6 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab("achievements")}
                  >
                    View All Achievements ({profileData.achievements.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activities & Skill Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(profileData.skill_levels).map(([activity, level]) => (
                <div key={activity} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{activity.replace('_', ' ')}</span>
                    <Badge className={getSkillLevelColor(level)}>
                      {getSkillLevelText(level)}
                    </Badge>
                  </div>
                  <Progress value={level * 25} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Preferred Times</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.preferred_times.map(time => (
                    <Badge key={time} variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Fitness Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.fitness_goals.map(goal => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {profileData.show_achievements ? (
            <Card>
              <CardHeader>
                <CardTitle>All Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profileData.achievements.map(renderAchievementBadge)}
                </div>
                {profileData.achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Complete activities and challenges to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Achievements are private</p>
                  <p className="text-sm">This user has chosen to keep their achievements private</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.activitiesOrganized}</div>
                    <div className="text-sm text-gray-600">Activities Organized</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.activitiesJoined}</div>
                    <div className="text-sm text-gray-600">Activities Joined</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData.stats.currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{profileData.stats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Avg. Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Social Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Clubs Joined</span>
                    <span className="font-bold text-lg">{profileData.stats.clubsJoined}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Connections</span>
                    <span className="font-bold text-lg">{profileData.stats.totalConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Achievements</span>
                    <span className="font-bold text-lg">{profileData.stats.achievementsEarned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Distance</span>
                    <span className="font-bold text-lg">{profileData.stats.totalDistance} km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Activity feed coming soon</p>
                <p className="text-sm">This will show recent activities, achievements, and updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
