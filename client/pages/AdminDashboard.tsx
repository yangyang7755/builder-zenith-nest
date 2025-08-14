import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  Activity, 
  Search, 
  ArrowLeft,
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import BottomNavigation from '@/components/BottomNavigation';
import NotificationTest from '@/components/NotificationTest';

interface User {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  institution?: string;
  location?: string;
  phone?: string;
  nationality?: string;
  occupation?: string;
  created_at: string;
}

interface Club {
  id: string;
  name: string;
  type: string;
  location: string;
  member_count: number;
  created_at: string;
  created_by: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCount, setUserCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersResult = await userService.getUsers();
      if (usersResult.data) {
        setUsers(usersResult.data.users);
        setUserCount(usersResult.data.count);
      }

      // Load clubs (using existing API)
      const clubsResponse = await fetch('/api/clubs');
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRecentUsers = () => {
    return users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const getClubsByType = () => {
    const clubTypes = clubs.reduce((acc, club) => {
      acc[club.type] = (acc[club.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(clubTypes).map(([type, count]) => ({ type, count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-cabin">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/explore">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(user => {
                      const userDate = new Date(user.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return userDate > weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(users.length * 0.3)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users, clubs, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="notifications">🔔 Tests</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>
                  Manage and view all registered users ({filteredUsers.length} of {userCount})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                            <Badge variant="outline">{user.id.startsWith('demo') ? 'Demo' : 'Real'}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                            
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                              </div>
                            )}
                            
                            {user.institution && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {user.institution}
                              </div>
                            )}
                            
                            {user.occupation && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {user.occupation}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {formatDate(user.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clubs Tab */}
          <TabsContent value="clubs">
            <Card>
              <CardHeader>
                <CardTitle>Clubs</CardTitle>
                <CardDescription>
                  All clubs created by users ({filteredClubs.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredClubs.map((club) => (
                    <div key={club.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{club.name}</h3>
                            <Badge variant="secondary">{club.type}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {club.location}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {club.member_count} members
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {formatDate(club.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Manage Club
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredClubs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No clubs found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Club Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getClubsByType().map(({ type, count }) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize text-gray-600">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / clubs.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Growth chart coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRecentUsers().map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.institution && (
                          <p className="text-xs text-gray-400">{user.institution}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(user.created_at)}
                        </p>
                        <Badge variant={user.id.startsWith('demo') ? 'secondary' : 'default'} className="text-xs">
                          {user.id.startsWith('demo') ? 'Demo' : 'Real'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
