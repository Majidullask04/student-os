import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';

import { api } from '../../services/api';
import { mockProfile } from '../../mocks/data';
import { StudentOsLogo } from '../ui/StudentOsLogo';

interface TopBarProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [userName, setUserName] = useState(mockProfile.name);
  const [userEmail, setUserEmail] = useState('user@example.com');

  useEffect(() => {
    api.getProfile().then((p) => {
      if (p) {
        if (p.name) {
          setUserName(p.name);
        }

        if (p.email) {
          setUserEmail(p.email);
        }
      }
    });
  }, []);

  const notifications = [
    {
      id: '1',
      title: 'Roadmap Milestone reached!',
      desc: 'You completed 3 topics in Backend & APIs.',
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'New Creator Resource added',
      desc: 'Andrej Karpathy released "LLM from Scratch Part 2".',
      time: '2h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Streak saved!',
      desc: '12 days in a row! You are on fire 🔥',
      time: '1d ago',
      unread: false,
    },
  ];

  // Logout
  const handleLogout = () => {
    // Remove your authentication token if you use one
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Go to login page
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">

      {/* Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <span className="font-bold text-slate-800 tracking-tight text-base">
          Student OS
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/70 hover:border-indigo-300 rounded-xl transition duration-150 shadow-2xs group text-left"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />

            <span className="truncate text-slate-500 group-hover:text-slate-700">
              Ask anything... (e.g. Best resources for RAG, What should I learn next?)
            </span>
          </div>

          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-400 font-medium shadow-2xs">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />

            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="font-semibold text-sm text-slate-800">
                  Notifications
                </span>

                <span className="text-[11px] font-medium text-indigo-600 cursor-pointer hover:underline">
                  Mark all as read
                </span>
              </div>

              <div className="space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition cursor-pointer ${
                      n.unread
                        ? 'bg-indigo-50/50 hover:bg-indigo-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {n.title}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {n.desc}
                        </p>

                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div
          className="relative pl-2 border-l border-slate-200"
          onMouseEnter={() => setShowProfile(true)}
          onMouseLeave={() => setShowProfile(false)}
        >

          {/* Profile Button */}
          <button
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt={userName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />

              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800">
                  Hi, {userName}
                </span>

                <span className="text-xs">👋</span>
              </div>

              <p className="text-[11px] font-medium text-slate-400">
                Keep going!
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* PROFILE DROPDOWN */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-[100]">

              {/* User Information */}
              <div className="p-3 bg-slate-50 rounded-xl mb-2">
                <div className="flex items-center gap-3">

                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    alt={userName}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {userName}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {userEmail}
                    </p>
                  </div>

                </div>
              </div>

              {/* My Profile */}
              <button
                onClick={() => {
                  window.location.href = '/profile';
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm text-slate-700 transition"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>My Profile</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  window.location.href = '/settings';
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm text-slate-700 transition"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </button>

              {/* Login */}
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm text-slate-700 transition"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Login</span>
              </button>

              <div className="my-2 border-t border-slate-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};
