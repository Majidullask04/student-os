import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Target, 
  Clock, 
  Maximize2, 
  Minimize2,
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowDown,
  Layers,
  Award,
  Zap,
  Check,
  ChevronDown
} from 'lucide-react';
import { TechRoadmap, RoadmapNodeData, RoadmapStageData } from '../../data/roadmapsData';

interface RoadmapGraphCanvasProps {
  roadmap: TechRoadmap;
  onSelectNode: (node: RoadmapNodeData) => void;
  selectedNodeId: string | null;
  nodeStatuses: Record<string, RoadmapNodeData['status']>;
  searchFilter: string;
  difficultyFilter?: string;
  statusFilter?: string;
}

export const RoadmapGraphCanvas: React.FC<RoadmapGraphCanvasProps> = ({
  roadmap,
  onSelectNode,
  selectedNodeId,
  nodeStatuses,
  searchFilter,
  difficultyFilter = 'all',
  statusFilter = 'all',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.7, Number((prev + delta).toFixed(1))), 1.3));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToStage = (stageId: string) => {
    const el = stageRefs.current[stageId];
    if (el && containerRef.current) {
      const topOffset = el.offsetTop - 80;
      containerRef.current.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
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

  const getStatusStyles = (status: RoadmapNodeData['status'], isSelected: boolean) => {
    if (status === 'completed') {
      return {
        card: isSelected
          ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-950/60'
          : 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        iconBg: 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/60',
        connectorDot: 'bg-emerald-400 border-emerald-500 shadow-sm shadow-emerald-400',
        connectorLine: '#10B981',
        label: 'Mastered'
      };
    }
    if (status === 'in_progress') {
      return {
        card: isSelected
          ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-400/80 shadow-2xl shadow-indigo-950/80'
          : 'bg-slate-900/95 border-indigo-500/70 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-950/60',
        badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 animate-pulse',
        iconBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/70',
        connectorDot: 'bg-indigo-400 border-indigo-500 shadow-md shadow-indigo-400 animate-ping',
        connectorLine: '#6366F1',
        label: 'In Progress'
      };
    }
    if (status === 'recommended') {
      return {
        card: isSelected
          ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-950/50'
          : 'bg-slate-900/85 border-amber-500/40 hover:border-amber-400 hover:shadow-md',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        iconBg: 'bg-amber-500 text-white shadow-xs shadow-amber-500/50',
        connectorDot: 'bg-amber-400 border-amber-500',
        connectorLine: '#F59E0B',
        label: 'Recommended'
      };
    }
    return {
      card: isSelected
        ? 'bg-slate-900 border-slate-400 ring-2 ring-slate-400/50 shadow-md'
        : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/90',
      badge: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
      iconBg: 'bg-slate-800 text-slate-400 border border-slate-700',
      connectorDot: 'bg-slate-600 border-slate-700',
      connectorLine: '#334155',
      label: 'To Learn'
    };
  };

  return (
    <div className={`relative rounded-3xl bg-[#090D16] border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl max-h-[calc(100vh-2rem)]' : ''}`}>
      {/* 1. Canvas Top Bar: Quick Phase Navigation & View Controls */}
      <div className="relative z-30 px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Phase Navigation Jumpers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">
            Phases:
          </span>
          {roadmap.stages.map((stage) => {
            const completedCount = stage.nodes.filter(n => getNodeStatus(n) === 'completed').length;
            const isStageMastered = completedCount === stage.nodes.length && stage.nodes.length > 0;

            return (
              <button
                key={stage.id}
                onClick={() => scrollToStage(stage.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition cursor-pointer whitespace-nowrap ${
                  isStageMastered
                    ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                    : completedCount > 0
                    ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={`Jump to ${stage.title}`}
              >
                <span className="font-bold">0{stage.stageNumber}</span>
                <span className="max-w-[100px] truncate">{stage.badge}</span>
                {isStageMastered && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Right: Legend & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Status Legend (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 pr-2 border-r border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
              <span>Mastered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Recommended</span>
            </div>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/70 text-slate-300">
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 hover:bg-slate-700 hover:text-white rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 hover:bg-slate-700 hover:text-white rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-1.5 py-0.5 text-[11px] font-mono hover:bg-slate-700 hover:text-white rounded-lg transition cursor-pointer"
              title="Reset View"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <div className="w-px h-3.5 bg-slate-700" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-slate-700 hover:text-white rounded-lg transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Canvas'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Architectural Canvas */}
      <div 
        ref={containerRef}
        className={`w-full overflow-auto bg-[#090D16] bg-dot-grid-dark transition-all duration-150 ${
          isFullscreen ? 'h-[calc(100vh-6rem)] p-6 sm:p-12' : 'max-h-[760px] p-6 sm:p-10'
        }`}
      >
        <div 
          className="max-w-4xl mx-auto space-y-16 transition-transform duration-150 origin-top"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {roadmap.stages.map((stage, sIdx) => {
            const isLastStage = sIdx === roadmap.stages.length - 1;
            const stageNodes = stage.nodes;
            const completedCount = stageNodes.filter(n => getNodeStatus(n) === 'completed').length;
            const isStageComplete = completedCount === stageNodes.length && stageNodes.length > 0;
            const stageHours = stageNodes.reduce((acc, n) => acc + (n.estimatedHours || 0), 0);

            return (
              <div 
                key={stage.id} 
                ref={(el) => (stageRefs.current[stage.id] = el)}
                className="relative flex flex-col items-center"
              >
                {/* Stage Milestone Hub */}
                <div className="relative z-20 w-full max-w-xl">
                  <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
                    isStageComplete
                      ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-emerald-950/40'
                      : 'bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border-slate-700 shadow-slate-950/60'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm font-bold shadow-xs shrink-0 ${
                          isStageComplete 
                            ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
                            : 'bg-indigo-600 text-white shadow-indigo-600/40'
                        }`}>
                          0{stage.stageNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                              Phase 0{stage.stageNumber} • {stage.badge}
                            </span>
                            {isStageComplete && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
                                Phase Completed
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {stage.title}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {completedCount} / {stageNodes.length} Done
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          ~{stageHours}h total
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed border-t border-slate-800/80 pt-2.5">
                      {stage.description}
                    </p>
                  </div>

                  {/* Stage Hub Bottom Anchor Point */}
                  <div className="flex justify-center -mb-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-xs" />
                  </div>
                </div>

                {/* Nodes Pipeline Container with Central Circuit Spine */}
                <div className="w-full relative mt-6">
                  {/* Central Spine Line running behind the nodes */}
                  <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-indigo-500/40 via-slate-700 to-indigo-500/40 pointer-events-none" />

                  {/* Nodes Grid (Alternating Left/Right on desktop, linear on mobile) */}
                  <div className="space-y-6 sm:space-y-8 relative z-10">
                    {stageNodes.map((node, nIdx) => {
                      const status = getNodeStatus(node);
                      const isSelected = selectedNodeId === node.id;
                      const matches = doesNodeMatch(node);
                      const styles = getStatusStyles(status, isSelected);
                      const isEven = nIdx % 2 === 0;
                      const nodeStepCode = `${stage.stageNumber}.${nIdx + 1}`;

                      return (
                        <div 
                          key={node.id}
                          className={`flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-200 ${
                            !matches ? 'opacity-30 pointer-events-none filter grayscale' : 'opacity-100'
                          }`}
                        >
                          {/* Left Column Container */}
                          <div className={`w-full lg:w-[46%] ${isEven ? 'lg:order-1' : 'lg:order-2 lg:ml-auto'}`}>
                            <div
                              onClick={() => onSelectNode(node)}
                              className={`group relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${styles.card}`}
                            >
                              {/* Glowing node header row */}
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${styles.iconBg}`}>
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

                                  <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-slate-200 transition">
                                    STEP {nodeStepCode}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
                                    ~{node.estimatedHours}h
                                  </span>

                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${styles.badge}`}>
                                    {styles.label}
                                  </span>

                                  {node.isKeyMilestone && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                                      ★ Milestone
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Title & Tagline */}
                              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                                {node.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {node.tagline}
                              </p>

                              {/* Checkpoint Bar & Explore CTA */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                                <span className="font-mono">
                                  {node.coreChecklist.length} checkpoints • {node.difficulty}
                                </span>

                                <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                                  Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Center Connector Dot */}
                          <div className="hidden lg:flex items-center justify-center w-8 shrink-0 lg:order-1.5 z-20">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${styles.connectorDot}`} />
                          </div>

                          {/* Empty balanced column spacer for alignment */}
                          <div className={`hidden lg:block w-[46%] ${isEven ? 'order-3' : 'order-1'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connecting Transit Spine to Next Stage */}
                {!isLastStage && (
                  <div className="relative my-8 flex flex-col items-center">
                    <svg width="40" height="70" viewBox="0 0 40 70" fill="none" className="overflow-visible">
                      {/* Ambient glow */}
                      <path
                        d="M20 0 V70"
                        stroke="rgba(99, 102, 241, 0.2)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="blur-[2px]"
                      />
                      {/* Central bus line */}
                      <path
                        d="M20 0 V70"
                        stroke="#334155"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Animated Flow Indicator */}
                      <path
                        d="M20 0 V70"
                        stroke="url(#spineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="path-electric-flow"
                      />
                      <defs>
                        <linearGradient id="spineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="50%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="relative -mt-2 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 animate-ping absolute" />
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-md shadow-indigo-500" />
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
