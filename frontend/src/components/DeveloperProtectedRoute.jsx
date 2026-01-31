import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useDeveloperCurrentUserQuery } from '../store/services/authApi';

export const DeveloperProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Check if user is developer
  const isDeveloper = user?.type === 'developer' || user?.role === 'DEVELOPER';
  
  // Only fetch if not authenticated or not a developer
  const { isLoading } = useDeveloperCurrentUserQuery(undefined, {
    skip: isAuthenticated && isDeveloper,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isDeveloper) {
    return <Navigate to="/developer/login" replace />;
  }

  return children;
};
