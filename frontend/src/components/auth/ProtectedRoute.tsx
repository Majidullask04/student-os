import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';
import { api } from '../../services/api';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // If Supabase session is not found, check localStorage for demo guest bypass
  const isDemoGuest = localStorage.getItem('student_os_demo_guest') === 'true';

  useEffect(() => {
    if (isAuthenticated || isDemoGuest) {
      api.isOnboarded()
        .then(status => setOnboarded(status))
        .catch(() => setOnboarded(true)); // don't lock out on network error
    } else {
      setOnboarded(null);
    }
  }, [isAuthenticated, isDemoGuest, location.pathname]);

  if (loading || ((isAuthenticated || isDemoGuest) && onboarded === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913] p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDemoGuest) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not yet completed onboarding, redirect to /onboarding
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
