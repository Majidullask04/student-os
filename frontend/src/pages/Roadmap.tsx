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
  Download,
  Share2,
  Check,
  RotateCcw
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

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
  const { totalNodesCount, completedNodesCount, totalCheckpointsCount, completedCheckpointsCount } = useMemo(() => {
    let totalNodes = 0;
    let completedNodes = 0;
    let totalChecks = 0;
    let completedChecks = 0;

    currentRoadmap.stages.forEach(stage => {
      stage.nodes.forEach(node => {
        totalNodes++;
        const status = nodeStatuses[node.id] || node.status;
        if (status === 'completed') completedNodes++;

        node.coreChecklist.forEach((_, idx) => {
          totalChecks++;
          if (completedChecklist[`${node.id}-${idx}`] || status === 'completed') {
            completedChecks++;
          }
        });
      });
    });

    return { 
      totalNodesCount: totalNodes, 
      completedNodesCount: completedNodes,
      totalCheckpointsCount: totalChecks,
      completedCheckpointsCount: completedChecks
    };
  }, [currentRoadmap, nodeStatuses, completedChecklist]);

  const completionPercentage = totalNodesCount > 0 ? Math.round((completedNodesCount / totalNodesCount) * 100) : 0;

  // Career Readiness evaluation
  const careerReadiness = useMemo(() => {
    if (completionPercentage >= 85) {
      return { tier: 'Staff / Production Ready', desc: 'Capable of owning high-scale distributed systems and architecture.', color: 'text-emerald-400' };
    }
    if (completionPercentage >= 55) {
      return { tier: 'Advanced Production Engineer', desc: 'Ready for full production lifecycles, debugging, and systems engineering.', color: 'text-indigo-400' };
    }
    if (completionPercentage >= 25) {
      return { tier: 'Core Systems Practitioner', desc: 'Strong foundation in core syntax, runtime models, and standard libraries.', color: 'text-blue-400' };
    }
    return { tier: 'Foundations Apprentice', desc: 'Building fundamental concepts, mental models, and environment setups.', color: 'text-amber-400' };
  }, [completionPercentage]);

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

    // Inform backend
    api.markTaskProgress({ taskId: nodeId, completed: newStatus === 'completed' }).catch(() => {});
  };

  // Quick toggle in syllabus view
  const handleQuickToggleComplete = (nodeId: string, currentStatus: RoadmapNodeData['status']) => {
    const nextStatus = currentStatus === 'completed' ? 'to_learn' : 'completed';
    handleUpdateNodeStatus(nodeId, nextStatus);

    if (nextStatus === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669', '#34D399', '#6366F1']
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

  // Export full syllabus as markdown document
  const handleExportSyllabus = () => {
    let md = `# ${currentRoadmap.title} (${currentRoadmap.role})\n`;
    md += `**Category:** ${currentRoadmap.category} | **Total Hours:** ~${currentRoadmap.totalHours}h | **Demand:** ${currentRoadmap.industryDemand}\n\n`;
    md += `> ${currentRoadmap.description}\n\n`;
    md += `## Curriculum Progress: ${completedNodesCount}/${totalNodesCount} Topics Mastered (${completionPercentage}%)\n\n`;
    md += `---\n\n`;

    currentRoadmap.stages.forEach(stage => {
      md += `### Phase ${stage.stageNumber}: ${stage.title} (${stage.badge})\n`;
      md += `*${stage.description}*\n\n`;

      stage.nodes.forEach((node, nIdx) => {
        const isDone = (nodeStatuses[node.id] || node.status) === 'completed';
        md += `#### ${isDone ? ' [x]' : ' [ ]'} Step ${stage.stageNumber}.${nIdx + 1}: ${node.title} (~${node.estimatedHours}h - ${node.difficulty})\n`;
        md += `*${node.tagline}*\n\n`;
        md += `**Senior Mental Model:**\n> ${node.seniorMentalModel}\n\n`;
        md += `**Core Verification Checkpoints:**\n`;
        node.coreChecklist.forEach((check, cIdx) => {
          const checkDone = completedChecklist[`${node.id}-${cIdx}`] || isDone;
          md += `- [${checkDone ? 'x' : ' '}] ${check}\n`;
        });
        md += `\n**Practical Challenge:** ${node.practicalChallenge.title}\n`;
        md += `${node.practicalChallenge.description}\n\n`;
        md += `---\n\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentRoadmap.role.toLowerCase().replace(/[^a-z0-9]/g, '_')}_curriculum.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Curriculum Exported', 'Downloaded complete structured markdown syllabus.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title="Engineering Specialization Roadmaps"
        subtitle="Production-grade curricula designed for software engineering mastery. Explore interconnected architecture milestones, senior mental models, system trade-offs, and verified project deliverables."
        badge={`${currentRoadmap.role} • 100% Unlocked`}
        badgeColor="indigo"
        icon={Map}
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'Engineering Roadmaps' },
          { label: currentRoadmap.role }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportSyllabus}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs btn-tactile cursor-pointer"
              title="Download structured Markdown syllabus"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Syllabus</span>
            </button>

            <button 
              onClick={() => setIsCustomizeModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs btn-tactile cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sprint Planner</span>
            </button>
          </div>
        }
      />

      {/* 2. Executive Curriculum KPI & Readiness Bar */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0A1128] text-white border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Track Mission & Career Readiness Tier */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                Industry-Standard Curriculum • {currentRoadmap.role}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {currentRoadmap.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Structured across {currentRoadmap.stages.length} key engineering phases. Each milestone pairs architectural mental models with real-world verification challenges, performance trade-offs, and production gotchas.
            </p>

            {/* Career Readiness Tier Indicator */}
            <div className="pt-2 flex items-center gap-3">
              <div className="text-[11px] font-mono text-slate-400">
                Evaluation Tier:
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono ${careerReadiness.color}`}>
                  {careerReadiness.tier}
                </span>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  — {careerReadiness.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {/* Total Duration */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80">
              <div className="text-[10px] font-mono uppercase text-slate-400">Curriculum Hours</div>
              <div className="text-lg font-bold text-white mt-0.5">
                ~{currentRoadmap.totalHours} <span className="text-xs text-slate-400 font-normal">hrs</span>
              </div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                {currentRoadmap.stages.length} Structured Phases
              </div>
            </div>

            {/* Checkpoints */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80">
              <div className="text-[10px] font-mono uppercase text-slate-400">Verified Checkpoints</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {completedCheckpointsCount} <span className="text-xs text-slate-400 font-normal">/ {totalCheckpointsCount}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Proof of Work
              </div>
            </div>

            {/* Completion Index */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">Mastery Progress</div>
              <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                <span>{completedNodesCount}/{totalNodesCount}</span>
                <span className="text-xs font-mono text-emerald-400 font-normal">
                  ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Goal & Role Switcher Bar with Filters */}
      <RoadmapGoalSelector
        currentRoadmapId={selectedRoadmapId}
        onSelectRoadmap={handleSelectRoadmap}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        completedCount={completedNodesCount}
        totalCount={totalNodesCount}
        onCustomizeSprint={() => setIsCustomizeModalOpen(true)}
      />

      {/* 4. Active View: Visual Graph vs Syllabus Checklist */}
      {viewMode === 'graph' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Interactive Architecture Pipeline</span>
              <span className="text-slate-400 hidden sm:inline">• Click any topic node to open senior mental models, system trade-offs & live intelligence</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {currentRoadmap.stages.length} Sequential Phases
            </span>
          </div>

          <RoadmapGraphCanvas
            roadmap={currentRoadmap}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id || null}
            nodeStatuses={nodeStatuses}
            searchFilter={searchQuery}
            difficultyFilter={difficultyFilter}
            statusFilter={statusFilter}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <RoadmapSyllabusView
            roadmap={currentRoadmap}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id || null}
            nodeStatuses={nodeStatuses}
            onQuickToggleComplete={handleQuickToggleComplete}
            searchFilter={searchQuery}
            difficultyFilter={difficultyFilter}
            statusFilter={statusFilter}
          />
        </div>
      )}

      {/* 5. Senior Masterclass Deep-Dive Drawer with Context.dev Live Intelligence */}
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
