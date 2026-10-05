import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Target, 
  Clock, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowDown
} from 'lucide-react';
import { TechRoadmap, RoadmapNodeData, RoadmapStageData } from '../../data/roadmapsData';

interface RoadmapGraphCanvasProps {
  roadmap: TechRoadmap;
  onSelectNode: (node: RoadmapNodeData) => void;
  selectedNodeId: string | null;
  nodeStatuses: Record<string, RoadmapNodeData['status']>;
  searchFilter: string;
}

export const RoadmapGraphCanvas: React.FC<RoadmapGraphCanvasProps> = ({
  roadmap,
  onSelectNode,
  selectedNodeId,
  nodeStatuses,
  searchFilter,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.7, prev + delta), 1.3));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getNodeStatus = (node: RoadmapNodeData): RoadmapNodeData['status'] => {
    return nodeStatuses[node.id] || node.status;
  };

  const getStatusStyles = (status: RoadmapNodeData['status'], isSelected: boolean) => {
    if (status === 'completed') {
      return {
        card: isSelected
          ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-950/50'
          : 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-950/40',
        iconBg: 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/50',
        text: 'text-emerald-100 font-bold',
        pill: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
      };
    }
    if (status === 'in_progress') {
      return {
        card: isSelected
          ? 'bg-indigo-950/50 border-indigo-400 ring-2 ring-indigo-400/70 shadow-xl shadow-indigo-950/60 pulse-ring-active'
          : 'bg-slate-900/90 border-indigo-500/60 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-950/50 pulse-ring-active',
        iconBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50 animate-pulse',
        text: 'text-indigo-100 font-bold',
        pill: 'bg-indigo-900/70 text-indigo-300 border border-indigo-700/60 font-semibold'
      };
    }
    if (status === 'recommended') {
      return {
        card: isSelected
          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-900/40'
          : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400 hover:shadow-md',
        iconBg: 'bg-amber-500 text-white shadow-xs shadow-amber-500/50',
        text: 'text-amber-100 font-bold',
        pill: 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
      };
    }
    if (status === 'optional') {
      return {
        card: isSelected
          ? 'bg-slate-800/80 border-dashed border-slate-500 ring-2 ring-slate-500/40'
          : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/60',
        iconBg: 'bg-slate-800 text-slate-400 border border-slate-700',
        text: 'text-slate-300 font-medium',
        pill: 'bg-slate-800 text-slate-400 border border-slate-700/50'
      };
    }
    return {
      card: isSelected
        ? 'bg-slate-800/90 border-indigo-400 ring-2 ring-indigo-400/40 shadow-md'
        : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/70',
      iconBg: 'bg-slate-800 text-slate-400 border border-slate-700/80',
      text: 'text-slate-200 font-medium',
      pill: 'bg-slate-800/80 text-slate-400 border border-slate-700/40'
    };
  };

  return (
    <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Visual Canvas Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-slate-300">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-1.5 rounded-xl hover:bg-slate-700 hover:text-white transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-1.5 rounded-xl hover:bg-slate-700 hover:text-white transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <button
          onClick={resetZoom}
          className="px-2 py-1 rounded-xl text-xs font-mono hover:bg-slate-700 hover:text-white transition cursor-pointer flex items-center gap-1"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{Math.round(zoomLevel * 100)}%</span>
        </button>
      </div>

      {/* Nature Legend */}
      <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-800/85 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>To Learn</span>
        </div>
      </div>

      {/* Ambient background glows for depth */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none glow-ambient-orbit" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none glow-ambient-orbit" />

      {/* Scrollable Graph Canvas */}
      <div 
        ref={containerRef}
        className="w-full max-h-[720px] overflow-auto p-8 sm:p-12 bg-[#0B0F19] bg-dot-grid-dark transition-all duration-200"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          {roadmap.stages.map((stage, sIdx) => {
            // Filter nodes if search query provided
            const filteredNodes = searchFilter.trim() === ''
              ? stage.nodes
              : stage.nodes.filter(n => 
                  n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  n.tagline.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  n.coreChecklist.some(c => c.toLowerCase().includes(searchFilter.toLowerCase()))
                );

            if (filteredNodes.length === 0 && searchFilter.trim() !== '') return null;

            const isLastStage = sIdx === roadmap.stages.length - 1;

            return (
              <div key={stage.id} className="relative flex flex-col items-center">
                {/* Stage Header Banner with specular sweep */}
                <div className="relative z-10 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 border border-slate-700/80 shadow-lg mb-6 specular-sweep">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                    {stage.stageNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{stage.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600/50">
                        {stage.badge}
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Nodes Grid for this Stage */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 px-2">
                  {filteredNodes.map((node, nIdx) => {
                    const status = getNodeStatus(node);
                    const isSelected = selectedNodeId === node.id;
                    const styles = getStatusStyles(status, isSelected);

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectNode(node)}
                        style={{ animationDelay: `${nIdx * 45}ms` }}
                        className={`group relative p-4 rounded-2xl border cursor-pointer spring-hover specular-sweep animate-cascade backdrop-blur-md ${styles.card}`}
                      >
                        {/* Top row: Status icon & Difficulty badge */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-110 ${styles.iconBg}`}>
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : status === 'in_progress' ? (
                              <Flame className="w-4 h-4" />
                            ) : status === 'recommended' ? (
                              <Target className="w-4 h-4" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                              ~{node.estimatedHours}h
                            </span>
                            {node.isKeyMilestone && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md badge-hologram text-white shadow-xs">
                                ★ Milestone
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <h4 className={`text-sm tracking-tight leading-snug line-clamp-2 transition-colors ${styles.text}`}>
                          {node.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {node.tagline}
                        </p>

                        {/* Node Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className="font-mono">
                            {node.coreChecklist.length} checkpoints
                          </span>
                          <span className="flex items-center gap-0.5 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                            Explore <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Electric Flow SVG between Stages */}
                {!isLastStage && (
                  <div className="relative my-7 flex flex-col items-center">
                    <svg width="48" height="60" viewBox="0 0 48 60" fill="none" className="overflow-visible">
                      {/* Ambient background glow path */}
                      <path
                        d="M24 0 V60"
                        stroke="rgba(16, 185, 129, 0.15)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="blur-[2px]"
                      />
                      {/* Base line */}
                      <path
                        d="M24 0 V60"
                        stroke="#1E293B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Flowing electric beam */}
                      <path
                        d="M24 0 V60"
                        stroke="url(#electricGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="path-electric-flow"
                      />
                      <defs>
                        <linearGradient id="electricGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="50%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Glowing energy orb node with ripple */}
                    <div className="relative -mt-1 flex items-center justify-center">
                      <div className="absolute w-5 h-5 rounded-full bg-emerald-400/30 animate-ping" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
