import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  SlidersHorizontal, 
  Map, 
  ListOrdered, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ChevronDown, 
  Layers, 
  Cpu, 
  Database, 
  Cloud, 
  Terminal, 
  Network, 
  Layout,
  ExternalLink
} from 'lucide-react';
import { ALL_ROADMAPS, TechRoadmap } from '../../data/roadmapsData';

interface RoadmapGoalSelectorProps {
  currentRoadmapId: string;
  onSelectRoadmap: (roadmapId: string) => void;
  viewMode: 'graph' | 'syllabus';
  onToggleViewMode: (mode: 'graph' | 'syllabus') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  completedCount: number;
  totalCount: number;
  onCustomizeSprint: () => void;
}

export const RoadmapGoalSelector: React.FC<RoadmapGoalSelectorProps> = ({
  currentRoadmapId,
  onSelectRoadmap,
  viewMode,
  onToggleViewMode,
  searchQuery,
  onSearchChange,
  completedCount,
  totalCount,
  onCustomizeSprint,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentRoadmap: TechRoadmap = ALL_ROADMAPS[currentRoadmapId] || ALL_ROADMAPS['frontend'];
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout': return Layout;
      case 'Database': return Database;
      case 'Layers': return Layers;
      case 'Cpu': return Cpu;
      case 'Cloud': return Cloud;
      case 'Terminal': return Terminal;
      case 'Network': return Network;
      default: return Compass;
    }
  };

  const CurrentIcon = getRoleIcon(currentRoadmap.icon);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
      {/* Top Row: Active Goal Pill, Switcher Dropdown, and Global Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Role Selection & Dropdown */}
        <div className="relative">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Learning Path & Career Track</span>
          </div>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all spring-hover specular-sweep text-left group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {currentRoadmap.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">
                  {currentRoadmap.industryDemand} Demand
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-sm">
                {currentRoadmap.description}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
          </button>

          {/* Goal Selector Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-40 animate-scale-in origin-top-left space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Your Goal / Career Track
              </div>

              {Object.values(ALL_ROADMAPS).map((rm) => {
                const Icon = getRoleIcon(rm.icon);
                const isSelected = rm.id === currentRoadmapId;

                return (
                  <button
                    key={rm.id}
                    onClick={() => {
                      onSelectRoadmap(rm.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{rm.title}</div>
                      <div className="text-[10px] text-slate-400">{rm.totalHours} hrs • {rm.stages.length} milestones</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Inspired by roadmap.sh</span>
                <span className="text-emerald-600 font-semibold">100% Unlocked</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Progress Metric & Action Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Completion Meter */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-500 ease-out"
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-slate-800">
                {percentage}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {completedCount} / {totalCount} Topics Mastered
              </div>
              <div className="text-[10px] text-slate-500">
                ~{currentRoadmap.totalHours} total learning hours
              </div>
            </div>
          </div>

          {/* Customize Sprint Button */}
          <button
            onClick={onCustomizeSprint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs btn-tactile cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Customize Pace</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Filter topics in ${currentRoadmap.role}... (e.g. Docker, Hooks, RAG)`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Toggle (Interactive Graph vs Syllabus Mode) */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold shrink-0">
          <button
            onClick={() => onToggleViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Visual Graph (roadmap.sh)</span>
          </button>
          <button
            onClick={() => onToggleViewMode('syllabus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'syllabus'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Syllabus & Checklist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
