import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, User, FolderGit2, Briefcase, X, ArrowRight } from 'lucide-react';
import { mockResources, mockCreators, mockProjects, mockJobs, mockRoadmap } from '../../mocks/data';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredResources = trimmed 
    ? mockResources.filter(r => r.title.toLowerCase().includes(trimmed) || r.category.toLowerCase().includes(trimmed))
    : mockResources.slice(0, 3);

  const filteredCreators = trimmed
    ? mockCreators.filter(c => c.name.toLowerCase().includes(trimmed) || c.tags.some(t => t.toLowerCase().includes(trimmed)))
    : mockCreators.slice(0, 3);

  const filteredModules = trimmed
    ? mockRoadmap.modules.filter(m => m.title.toLowerCase().includes(trimmed) || m.tasks.some(t => t.title.toLowerCase().includes(trimmed)))
    : mockRoadmap.modules.slice(0, 2);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleAskAI = () => {
    navigate(`/assistant?prompt=${encodeURIComponent(query || 'What should I learn next?')}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleAskAI();
              }
            }}
            placeholder="Ask anything... (e.g. Best resources for RAG, FastAPI, Docker)"
            className="w-full text-slate-800 placeholder-slate-400 text-base bg-transparent border-none outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-500 font-mono">ESC</span>
        </div>

        {/* Action: Ask AI prompt */}
        {query.trim() && (
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <button
              onClick={handleAskAI}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-white/80 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>Ask AI Agent: <strong>&ldquo;{query}&rdquo;</strong></span>
              </div>
              <span className="flex items-center text-xs text-indigo-500 font-medium">
                Enter <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-5 text-sm">
          {/* Roadmap modules */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Roadmap Stages & Tasks
            </div>
            <div className="space-y-1">
              {filteredModules.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelect('/roadmap')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {m.number}
                    </span>
                    <span className="font-medium text-slate-800 group-hover:text-indigo-600">{m.title}</span>
                    <span className="text-xs text-slate-400">({m.completedTasks}/{m.totalTasks} completed)</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recommended Resources
            </div>
            <div className="space-y-1">
              {filteredResources.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect('/resources')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img src={r.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-slate-800 truncate group-hover:text-indigo-600">{r.title}</p>
                      <p className="text-xs text-slate-400">{r.creator} • {r.platform}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">{r.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creators */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Top Creators
            </div>
            <div className="space-y-1">
              {filteredCreators.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect('/creators')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={c.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-indigo-600">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.handle} • {c.followers}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-indigo-600 hover:underline">View Profile</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono">↓</kbd></span>
            <span>Select <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono">↵</kbd></span>
          </div>
          <span>Student OS Intelligence</span>
        </div>
      </div>
    </div>
  );
};
