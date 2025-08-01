import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, LogIn, LogOut, Crown } from "lucide-react";

export default function DemoAuth() {
  const { user, profile, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      // Since we don't have real Supabase configured, simulate a successful sign in
      toast({
        title: "Demo Sign In",
        description:
          "This is a demo sign in. In production, this would authenticate with Supabase.",
        variant: "default",
      });

      // In a real app, this would call signIn with real credentials
      // await signIn('demo@example.com', 'password');
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Failed to sign in. This is expected in demo mode.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Signed In
              </Badge>
              {profile?.university && (
                <Badge variant="outline">
                  <Crown className="h-3 w-3 mr-1" />
                  {profile.university}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {profile?.bio && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {profile.bio}
                </p>
              )}
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              disabled={loading}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {loading ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Badge variant="outline" className="bg-gray-100">
              Not Signed In
            </Badge>

            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border border-green-200">
              <p className="font-medium text-green-800 mb-1">
                Demo Mode Active
              </p>
              <p className="text-green-700">
                Backend is running with demo data! All features work including
                profile management, club data, and activities. Ready for
                Supabase integration.
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/signin">Sign In</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500">
                Use any email/password - it's all demo mode!
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            <strong>Backend Features Available:</strong>
          </p>
          <ul className="text-xs text-gray-500 mt-1 space-y-1">
            <li>• User Profile Management</li>
            <li>• Club Management System</li>
            <li>• Real-time Chat (simulated)</li>
            <li>• Activity Creation & Management</li>
            <li>• Member Request System</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
