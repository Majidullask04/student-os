import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, 
  Sparkles, 
  SlidersHorizontal, 
  BookOpen, 
  Flame, 
  Target, 
  CheckCircle2, 
  Layers, 
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Bot
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

import { ALL_ROADMAPS, TechRoadmap, RoadmapNodeData } from '../data/roadmapsData';
import { RoadmapGoalSelector } from '../components/roadmap/RoadmapGoalSelector';
import { RoadmapGraphCanvas } from '../components/roadmap/RoadmapGraphCanvas';
import { RoadmapSyllabusView } from '../components/roadmap/RoadmapSyllabusView';
import { RoadmapNodeDrawer } from '../components/roadmap/RoadmapNodeDrawer';
import { RoadmapCustomizeModal } from '../components/roadmap/RoadmapCustomizeModal';

export const Roadmap: React.FC = () => {
  const { success, info } = useToast();

  // 1. Current Active Roadmap Track
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(() => {
    const saved = localStorage.getItem('student_os_active_roadmap_id');
    if (saved && ALL_ROADMAPS[saved]) return saved;
    return 'frontend';
  });

  // 2. View Mode (Visual Graph canvas vs Structured Syllabus)
  const [viewMode, setViewMode] = useState<'graph' | 'syllabus'>(() => {
    return (localStorage.getItem('student_os_roadmap_view_mode') as any) || 'graph';
  });

  // 3. Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 4. Selected Node for Deep Dive Drawer
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // 5. Customize Pace Modal
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);

  // 6. Node Statuses Storage & Checklist tracking (persisted locally)
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, RoadmapNodeData['status']>>(() => {
    const saved = localStorage.getItem('student_os_node_statuses');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('student_os_node_checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  // Load user profile on mount to sync initial goal if available
  useEffect(() => {
    api.getProfile().then(profile => {
      if (profile?.goal) {
        const goalLower = profile.goal.toLowerCase();
        let matchedId = 'frontend';
        if (goalLower.includes('front')) matchedId = 'frontend';
        else if (goalLower.includes('back')) matchedId = 'backend';
        else if (goalLower.includes('full')) matchedId = 'fullstack';
        else if (goalLower.includes('ai') || goalLower.includes('ml')) matchedId = 'ai-engineer';
        else if (goalLower.includes('devops') || goalLower.includes('cloud')) matchedId = 'devops';
        else if (goalLower.includes('dsa') || goalLower.includes('algorithm')) matchedId = 'dsa-cs';
        else if (goalLower.includes('system')) matchedId = 'system-design';

        if (!localStorage.getItem('student_os_active_roadmap_id')) {
          setSelectedRoadmapId(matchedId);
        }
      }
    }).catch(() => {});
  }, []);

  const currentRoadmap: TechRoadmap = ALL_ROADMAPS[selectedRoadmapId] || ALL_ROADMAPS['frontend'];

  // Calculate statistics
  const { totalNodesCount, completedNodesCount } = useMemo(() => {
    let total = 0;
    let completed = 0;
    currentRoadmap.stages.forEach(stage => {
      stage.nodes.forEach(node => {
        total++;
        const status = nodeStatuses[node.id] || node.status;
        if (status === 'completed') completed++;
      });
    });
    return { totalNodesCount: total, completedNodesCount: completed };
  }, [currentRoadmap, nodeStatuses]);

  // Handle roadmap selection
  const handleSelectRoadmap = (newRoadmapId: string) => {
    setSelectedRoadmapId(newRoadmapId);
    localStorage.setItem('student_os_active_roadmap_id', newRoadmapId);
    const chosen = ALL_ROADMAPS[newRoadmapId];
    if (chosen) {
      api.saveProfile({ goal: chosen.role, targetRole: chosen.role }).catch(() => {});
      success('Active Goal Updated', `Switched path to ${chosen.title}.`);
    }
  };

  const handleToggleViewMode = (mode: 'graph' | 'syllabus') => {
    setViewMode(mode);
    localStorage.setItem('student_os_roadmap_view_mode', mode);
  };

  // Node selection for deep dive
  const handleSelectNode = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  // Node status change
  const handleUpdateNodeStatus = (nodeId: string, newStatus: RoadmapNodeData['status']) => {
    setNodeStatuses(prev => {
      const updated = { ...prev, [nodeId]: newStatus };
      localStorage.setItem('student_os_node_statuses', JSON.stringify(updated));
      return updated;
    });

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, status: newStatus });
    }

    // Inform backend/localStorage
    api.markTaskProgress({ taskId: nodeId, completed: newStatus === 'completed' }).catch(() => {});
  };

  // Quick toggle in syllabus view
  const handleQuickToggleComplete = (nodeId: string, currentStatus: RoadmapNodeData['status']) => {
    const nextStatus = currentStatus === 'completed' ? 'to_learn' : 'completed';
    handleUpdateNodeStatus(nodeId, nextStatus);

    if (nextStatus === 'completed') {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669', '#34D399', '#D97706']
      });
    }
  };

  // Checklist toggle
  const handleToggleChecklist = (nodeId: string, itemIdx: number) => {
    const key = `${nodeId}-${itemIdx}`;
    setCompletedChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('student_os_node_checklist', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header with Breadcrumbs & Senior Engineer Positioning */}
      <PageHeader
        title="Interactive Developer Roadmaps"
        subtitle={`Step-by-step interactive learning path designed by Senior Engineers. Dynamic, open, and verified with portfolio challenges.`}
        badge={`${currentRoadmap.role} • 100% Unlocked`}
        badgeColor="indigo"
        icon={Map}
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'Developer Roadmaps' },
          { label: currentRoadmap.role }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCustomizeModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs btn-tactile cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customize Sprint</span>
            </button>
          </div>
        }
      />

      {/* 2. Nature & Senior Engineer Banner: The Essence of Senior Mastery */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0A1124] text-white border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle organic ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                Organic Engineering Mastery • Non-AI Hype
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Learn What Actually Matters in Production
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Unlike generic AI-generated checklists, this curriculum is grounded in real production engineering realities: system trade-offs, architectural gotchas, latency physics, and hands-on portfolio proof of work. Every single topic is unlocked and accessible.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">Roadmap Progress</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{completedNodesCount} / {totalNodesCount} Topics</span>
                <span className="text-xs font-mono font-normal text-emerald-400">
                  ({totalNodesCount > 0 ? Math.round((completedNodesCount / totalNodesCount) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Goal & Role Switcher Bar */}
      <RoadmapGoalSelector
        currentRoadmapId={selectedRoadmapId}
        onSelectRoadmap={handleSelectRoadmap}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        completedCount={completedNodesCount}
        totalCount={totalNodesCount}
        onCustomizeSprint={() => setIsCustomizeModalOpen(true)}
      />

      {/* 4. Active View: Visual Graph (roadmap.sh style) vs Syllabus Checklist */}
      {viewMode === 'graph' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Interactive Visual Node Network</span>
              <span className="text-slate-400 hidden sm:inline">• Click any topic node to explore senior mental models & challenges</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Showing {currentRoadmap.stages.length} milestones
            </span>
          </div>

          <RoadmapGraphCanvas
            roadmap={currentRoadmap}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id || null}
            nodeStatuses={nodeStatuses}
            searchFilter={searchQuery}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">Hierarchical Syllabus & Checkpoints</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {completedNodesCount} of {totalNodesCount} complete
            </span>
          </div>

          <RoadmapSyllabusView
            roadmap={currentRoadmap}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id || null}
            nodeStatuses={nodeStatuses}
            onQuickToggleComplete={handleQuickToggleComplete}
            searchFilter={searchQuery}
          />
        </div>
      )}

      {/* 5. Senior Masterclass Deep-Dive Drawer */}
      <RoadmapNodeDrawer
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateNodeStatus}
        completedChecklist={completedChecklist}
        onToggleChecklist={handleToggleChecklist}
      />

      {/* 6. Customize Sprint Pace Modal */}
      <RoadmapCustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        currentRole={currentRoadmap.role}
        onApplyCustomization={(settings) => {
          info('Pace Calibrated', `Customized for ${settings.hoursPerDay}h/day at ${settings.pace} velocity.`);
        }}
      />
    </div>
  );
};

export default Roadmap;
