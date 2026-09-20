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
  Rocket,
  Atom
} from 'lucide-react';

import { StudentOsLogo } from '../ui/StudentOsLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Roadmap', path: '/roadmap', icon: Map },
    { label: 'AI Assistant', path: '/assistant', icon: Bot },
    { label: 'Learning Resources', path: '/resources', icon: BookOpen },
    { label: 'Creators', path: '/creators', icon: Users2 },
    { label: 'Community', path: '/community', icon: MessageSquare },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Career Hub', path: '/career', icon: Briefcase },
    { label: 'College & Academics', path: '/academics', icon: GraduationCap },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'Settings', path: '/settings', icon: Settings },
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
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 pt-5 pb-4">
          <StudentOsLogo size={36} showText={true} theme="dark" />
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto dark-sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition duration-150 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Motivational Card at Bottom */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/70 border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                A better you <br />is in progress.
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium font-handwriting text-sm text-purple-300">
                Small steps. Big future.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
