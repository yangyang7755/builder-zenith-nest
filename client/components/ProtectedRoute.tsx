import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
            <p className="text-gray-500">Checking authentication status</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is logged in but trying to access auth pages, redirect to home
  if (!requireAuth && user && (location.pathname === '/signin' || location.pathname === '/signup')) {
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
}

// Convenience component for pages that don't require auth
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}

// Higher-order component for protecting entire page components
export function withAuthProtection<T extends object>(
  Component: React.ComponentType<T>,
  requireAuth: boolean = true
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute requireAuth={requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
