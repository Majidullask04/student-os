import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Bot, 
  BookOpen, 
  Users2, 
  MessageSquare, 
  FolderGit2, 
  Briefcase, 
  GraduationCap, 
  BarChart3, 
  Bookmark, 
  Settings, 
  Activity,
  Sparkles
} from 'lucide-react';

import { StudentOsLogo } from '../ui/StudentOsLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavGroup {
  category: string;
  items: { label: string; path: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navGroups: NavGroup[] = [
    {
      category: 'WORKSPACE',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'My Roadmap', path: '/roadmap', icon: Map, badge: 'Live' },
        { label: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'AI' },
      ]
    },
    {
      category: 'KNOWLEDGE & NETWORK',
      items: [
        { label: 'Learning Resources', path: '/resources', icon: BookOpen },
        { label: 'Creators Matrix', path: '/creators', icon: Users2 },
        { label: 'Community', path: '/community', icon: MessageSquare },
      ]
    },
    {
      category: 'PROOF OF WORK',
      items: [
        { label: 'Projects & Blueprints', path: '/projects', icon: FolderGit2 },
        { label: 'Career & 5D Job Fit', path: '/career', icon: Briefcase, badge: 'Hot' },
        { label: 'Progress Metrics', path: '/progress', icon: BarChart3 },
      ]
    },
    {
      category: 'SYSTEM',
      items: [
        { label: 'College & Academics', path: '/academics', icon: GraduationCap },
        { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Fixed Dark Navy Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0A0F1D] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800/60 flex items-center justify-between">
          <StudentOsLogo size={32} showText={true} theme="dark" />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-medium text-indigo-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>v2.4</span>
          </div>
        </div>

        {/* Navigation List with Semantic Groups */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto dark-sidebar">
          {navGroups.map((group) => (
            <div key={group.category} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                {group.category}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 border border-indigo-500/40 translate-x-0.5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:translate-x-1'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 transition duration-200 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : item.badge === 'AI' 
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' 
                                : item.badge === 'Hot'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Live System Telemetry Card */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800/90 shadow-inner space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-200">Engine Online</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-medium">● 28ms</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 space-y-1 border-t border-slate-800/80 pt-1.5">
            <div className="flex justify-between">
              <span>Stack:</span>
              <span className="text-slate-300">FastAPI + pgvector</span>
            </div>
            <div className="flex justify-between">
              <span>RAG Engine:</span>
              <span className="text-indigo-400">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
