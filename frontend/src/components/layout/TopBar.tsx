import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { StudentOsLogo } from '../ui/StudentOsLogo';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch, onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState(user?.user_metadata?.name || 'Student');

  useEffect(() => {
    if (user?.user_metadata?.name) {
      setUserName(user.user_metadata.name);
    } else {
      api.getProfile().then(p => {
        if (p && p.name) setUserName(p.name);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem('student_os_demo_guest');
    localStorage.removeItem('student_os_auth_token');
    await signOut();
    navigate('/login');
  };

  const notifications = [
    { id: '1', title: 'Roadmap Milestone reached!', desc: 'You completed 3 topics in Backend & APIs.', time: '10m ago', unread: true },
    { id: '2', title: 'New Creator Resource added', desc: 'Andrej Karpathy released "LLM from Scratch Part 2".', time: '2h ago', unread: true },
    { id: '3', title: 'Streak saved!', desc: '12 days in a row! Continuous learning streak.', time: '1d ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Sidebar Toggle & Logo preview */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <StudentOsLogo size={28} showText={true} theme="light" />
      </div>

      {/* Global Search Bar */}
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

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Telemetry pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Core v2.4 • Online</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition btn-tactile"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Telemetry Notifications</span>
                <span className="text-[11px] font-medium text-indigo-600 cursor-pointer hover:underline">
                  Clear
                </span>
              </div>
              <div className="space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition cursor-pointer ${
                      n.unread ? 'bg-indigo-50/40 hover:bg-indigo-50/70 border border-indigo-100/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Dropdown */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition focus:outline-none btn-tactile"
            aria-label="User menu"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-2xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">{userName}</span>
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                {user?.email || 'student@workspace'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Demo Mode (Offline)'}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
