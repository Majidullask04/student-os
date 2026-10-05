import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  BookOpen, 
  Flame, 
  Target, 
  Sparkles,
  ExternalLink,
  Award,
  Check,
  RotateCcw,
  Layers,
  ChevronUp
} from 'lucide-react';
import { TechRoadmap, RoadmapNodeData, RoadmapStageData } from '../../data/roadmapsData';

interface RoadmapSyllabusViewProps {
  roadmap: TechRoadmap;
  onSelectNode: (node: RoadmapNodeData) => void;
  selectedNodeId: string | null;
  nodeStatuses: Record<string, RoadmapNodeData['status']>;
  onQuickToggleComplete: (nodeId: string, currentStatus: RoadmapNodeData['status']) => void;
  searchFilter: string;
  difficultyFilter?: string;
  statusFilter?: string;
}

export const RoadmapSyllabusView: React.FC<RoadmapSyllabusViewProps> = ({
  roadmap,
  onSelectNode,
  selectedNodeId,
  nodeStatuses,
  onQuickToggleComplete,
  searchFilter,
  difficultyFilter = 'all',
  statusFilter = 'all',
}) => {
  const [expandedStageIds, setExpandedStageIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    roadmap.stages.forEach(s => { initial[s.id] = true; });
    return initial;
  });

  const toggleStage = (stageId: string) => {
    setExpandedStageIds(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    roadmap.stages.forEach(s => { next[s.id] = true; });
    setExpandedStageIds(next);
  };

  const collapseAll = () => {
    setExpandedStageIds({});
  };

  const getNodeStatus = (node: RoadmapNodeData): RoadmapNodeData['status'] => {
    return nodeStatuses[node.id] || node.status;
  };

  // Check if node matches all active filters
  const doesNodeMatch = (node: RoadmapNodeData): boolean => {
    const status = getNodeStatus(node);
    
    // 1. Search Query
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      const matchTitle = node.title.toLowerCase().includes(q);
      const matchTag = node.tagline.toLowerCase().includes(q);
      const matchChecklist = node.coreChecklist.some(c => c.toLowerCase().includes(q));
      if (!matchTitle && !matchTag && !matchChecklist) return false;
    }

    // 2. Difficulty Filter
    if (difficultyFilter !== 'all' && node.difficulty !== difficultyFilter) {
      return false;
    }

    // 3. Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'milestones') {
        if (!node.isKeyMilestone) return false;
      } else if (statusFilter === 'completed' && status !== 'completed') {
        return false;
      } else if (statusFilter === 'in_progress' && status !== 'in_progress') {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="space-y-4">
      {/* Syllabus Header Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">Modular Curriculum Matrix</span>
          <span className="text-slate-400 hidden sm:inline">• {roadmap.stages.length} Phases Organized for Systematic Execution</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={collapseAll}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {roadmap.stages.map((stage) => {
        // Filter stage nodes
        const filteredNodes = stage.nodes.filter(doesNodeMatch);
        if (filteredNodes.length === 0 && (searchFilter.trim() !== '' || difficultyFilter !== 'all' || statusFilter !== 'all')) {
          return null;
        }

        const isExpanded = Boolean(expandedStageIds[stage.id]);
        const completedInStage = stage.nodes.filter(n => getNodeStatus(n) === 'completed').length;
        const stagePercentage = stage.nodes.length > 0 ? Math.round((completedInStage / stage.nodes.length) * 100) : 0;
        const totalStageHours = stage.nodes.reduce((acc, n) => acc + (n.estimatedHours || 0), 0);

        return (
          <div 
            key={stage.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300"
          >
            {/* Stage Header Banner */}
            <div 
              onClick={() => toggleStage(stage.id)}
              className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold font-mono shrink-0 shadow-xs ${
                  stagePercentage === 100
                    ? 'bg-emerald-500 text-white'
                    : stagePercentage > 0
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  0{stage.stageNumber}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {stage.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {stage.badge}
                    </span>
                    {stagePercentage === 100 && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Phase Mastered
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Stage Progress & Collapse Arrow */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {completedInStage} / {stage.nodes.length} Completed ({stagePercentage}%)
                  </span>
                  <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden mt-1.5 p-0.5 border border-slate-200/60">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        stagePercentage === 100 
                          ? 'bg-emerald-500' 
                          : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                      }`}
                      style={{ width: `${stagePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-transform duration-200">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Stage Nodes Content */}
            {isExpanded && (
              <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-3 animate-fade-in">
                {filteredNodes.map((node, nIdx) => {
                  const status = getNodeStatus(node);
                  const isCompleted = status === 'completed';
                  const isSelected = selectedNodeId === node.id;
                  const stepNumber = `${stage.stageNumber}.${nIdx + 1}`;

                  return (
                    <div
                      key={node.id}
                      className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200 shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/50'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Left: Quick complete toggle + Node Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onQuickToggleComplete(node.id, status)}
                          className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-600 transition-transform active:scale-75 hover:scale-110 cursor-pointer"
                          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 hover:text-indigo-600 transition" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              STEP {stepNumber}
                            </span>
                            <h4 
                              onClick={() => onSelectNode(node)}
                              className={`text-sm font-bold cursor-pointer hover:text-indigo-600 transition ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}
                            >
                              {node.title}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {node.difficulty}
                            </span>
                            {status === 'in_progress' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3 text-indigo-600" /> In Progress
                              </span>
                            )}
                            {node.isKeyMilestone && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                ★ Milestone
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {node.tagline}
                          </p>

                          {/* Senior mental model teaser */}
                          {node.seniorMentalModel && (
                            <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1 font-sans">
                              "{node.seniorMentalModel}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Hours, Checkpoints count & Deep Dive button */}
                      <div className="flex items-center gap-3 shrink-0 ml-8 sm:ml-0">
                        <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                          ~{node.estimatedHours}h • {node.coreChecklist.length} checkpoints
                        </div>

                        <button
                          onClick={() => onSelectNode(node)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Senior Deep Dive</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
