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
  Filter,
  X,
  Target,
  Award
} from 'lucide-react';
import { ALL_ROADMAPS, TechRoadmap } from '../../data/roadmapsData';

interface RoadmapGoalSelectorProps {
  currentRoadmapId: string;
  onSelectRoadmap: (roadmapId: string) => void;
  viewMode: 'graph' | 'syllabus';
  onToggleViewMode: (mode: 'graph' | 'syllabus') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (diff: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
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
  difficultyFilter,
  onDifficultyFilterChange,
  statusFilter,
  onStatusFilterChange,
  completedCount,
  totalCount,
  onCustomizeSprint,
}) => {
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

  const getReadinessTier = (pct: number) => {
    if (pct >= 85) return { tier: 'Staff / Production Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 55) return { tier: 'Advanced Production Engineer', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (pct >= 25) return { tier: 'Core Systems Practitioner', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { tier: 'Foundations Apprentice', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const readiness = getReadinessTier(percentage);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
      {/* 1. Track Selection: Instant 1-Click Horizontal Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] font-mono">
              Engineering Specialization Tracks
            </span>
            <span className="text-slate-400 hidden sm:inline">• 7 Professional Curricula</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${readiness.color}`}>
              {readiness.tier}
            </span>
          </div>
        </div>

        {/* Scrollable track selection pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
          {Object.values(ALL_ROADMAPS).map((rm) => {
            const Icon = getRoleIcon(rm.icon);
            const isSelected = rm.id === currentRoadmapId;

            return (
              <button
                key={rm.id}
                onClick={() => onSelectRoadmap(rm.id)}
                className={`snap-start shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-900/10 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold whitespace-nowrap">
                      {rm.role}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className={`text-[10px] font-mono flex items-center gap-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    <span>~{rm.totalHours}h</span>
                    <span>•</span>
                    <span>{rm.stages.length} phases</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Row: Active Track Overview & Progress Metrics */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {currentRoadmap.title}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {currentRoadmap.industryDemand} Demand
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {currentRoadmap.category}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentRoadmap.description}
          </p>
        </div>

        {/* Progress & Quick Customize */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Circular Meter */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
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
              <span className="absolute text-[10px] font-mono font-bold text-slate-800">
                {percentage}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {completedCount} / {totalCount} Mastered
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                ~{currentRoadmap.totalHours} hrs curriculum
              </div>
            </div>
          </div>

          {/* Customize Button */}
          <button
            onClick={onCustomizeSprint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs btn-tactile cursor-pointer"
            title="Adjust daily study hours and target sprint deadline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Pace Settings</span>
          </button>
        </div>
      </div>

      {/* 3. Controls Bar: Search, Difficulty Chips, and View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        {/* Left: Search & Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search topics in ${currentRoadmap.role}...`}
              className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Difficulty Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'Foundational', label: 'Foundational' },
              { id: 'Core', label: 'Core' },
              { id: 'Advanced', label: 'Advanced' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => onDifficultyFilterChange(d.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  difficultyFilter === d.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'completed', label: 'Mastered' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'milestones', label: '★ Milestones' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => onStatusFilterChange(s.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === s.id
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onToggleViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Interactive Pathway</span>
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
            <span>Curriculum Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
