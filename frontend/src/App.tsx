import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Assistant } from './pages/Assistant';
import { Resources } from './pages/Resources';
import { Creators } from './pages/Creators';
import { Community } from './pages/Community';
import { Projects } from './pages/Projects';
import { Career } from './pages/Career';
import { Progress } from './pages/Progress';
import { Bookmarks } from './pages/Bookmarks';
import { Academics } from './pages/Academics';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Standalone Authentication & Onboarding Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Main Application with Fixed Dark Navy Sidebar & Shell */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/community" element={<Community />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/career" element={<Career />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
