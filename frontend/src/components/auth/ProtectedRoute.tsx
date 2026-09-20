import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // If Supabase session is not found, check localStorage for demo guest bypass
  const isDemoGuest = localStorage.getItem('student_os_demo_guest') === 'true';

  if (!isAuthenticated && !isDemoGuest) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
