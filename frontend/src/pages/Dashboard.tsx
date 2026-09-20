import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Target, 
  Flame, 
  BookOpen, 
  FolderGit2, 
  Users2, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Database, 
  Send, 
  Paperclip, 
  Mic, 
  ArrowRight, 
  ExternalLink,
  Bot,
  Code2,
  Briefcase,
  Layers,
  Compass,
  Sun
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { api, getDynamicFallbackProfile } from '../services/api';
import { Profile, Roadmap, ProgressMetric, Creator, Resource } from '../types';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ShinyText } from '../components/ui/ShinyText';
import { CountUp } from '../components/ui/CountUp';
import { GridPattern } from '../components/ui/GridPattern';
import { Magnet } from '../components/ui/Magnet';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(getDynamicFallbackProfile());
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [focusTasks, setFocusTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric>({
    topicsCompleted: 0,
    totalTopics: 1,
    learningHours: 0,
    projectsCount: 0,
    activeProjects: 0,
    currentStreak: 1,
    roadmapPercentage: 0,
    skillGrowthPercentage: 0,
  });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    api.getProfile().then(setProfile);
    api.getRoadmap().then(setRoadmap);
    api.getTodaysFocus().then(setFocusTasks);
    api.getProgressMetrics().then(setMetrics);
    api.getCreators().then(setCreators);
    api.getRecommendedResources().then(setResources);
  }, []);

  const handleToggleFocus = (id: string) => {
    const t = focusTasks.find(x => x.id === id);
    const nextState = !t?.completed;
    if (nextState) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
    api.toggleFocusItem(id).then(items => {
      setFocusTasks([...items]);
      api.getRoadmap().then(setRoadmap);
      api.getProgressMetrics().then(setMetrics);
    });
  };

  const handleToggleModuleTask = (taskId: string) => {
    if (!activeModule) return;
    const currentTask = activeModule.tasks.find(t => t.id === taskId);
    if (!currentTask) return;
    const nextState = !currentTask.completed;
    if (nextState) {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    }
    api.markTaskProgress({ taskId, completed: nextState }).then(res => {
      setRoadmap(res.roadmap);
      api.getProgressMetrics().then(setMetrics);
      api.getTodaysFocus().then(setFocusTasks);
    });
  };

  const handleSendPrompt = (promptText?: string) => {
    const text = promptText || chatInput;
    if (!text.trim()) return;
    navigate(`/assistant?prompt=${encodeURIComponent(text.trim())}`);
  };

  // Derive dynamic active module (first in progress or incomplete)
  const activeModule = roadmap?.modules?.find(m => m.status === 'In Progress' || m.percentage < 100) || roadmap?.modules?.[0];
  const activeModuleTasks = activeModule?.tasks || [];

  // Derive dynamic stages from the user's roadmap
  const dashboardStages = roadmap?.stages && roadmap.stages.length > 0
    ? roadmap.stages.map(st => ({
        num: st.stageNumber,
        title: st.title,
        status: st.status
      }))
    : [
        { num: 1, title: 'Foundations', status: 'In Progress' },
        { num: 2, title: 'Core Concepts', status: 'Upcoming' },
        { num: 3, title: 'AI & Systems', status: 'Upcoming' },
        { num: 4, title: 'Build Projects', status: 'Upcoming' },
        { num: 5, title: 'Deploy & DevOps', status: 'Upcoming' },
        { num: 6, title: 'Career & Jobs', status: 'Upcoming' },
      ];

  const currentStageObj = roadmap?.stages?.find(s => s.status === 'In Progress' || s.status === 'Next') || roadmap?.stages?.[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 md:p-7 shadow-xs">
        <GridPattern className="opacity-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>Adaptive Agent Active</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">Syncing with roadmap</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Good morning, {profile.name}</span>
              <Sun className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Your personal AI agent has evaluated your active skills and prepared your next roadmap action.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                GOAL: {profile.goal.toUpperCase()}
              </span>
              <span>•</span>
              <span>Stage {currentStageObj?.stageNumber || 1} in progress ({currentStageObj?.title || 'Foundations'})</span>
            </div>
          </div>

          {/* Engineering Workspace Status Panel */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 border border-slate-800 shadow-xs space-y-2.5 min-w-[240px] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-white">LIVE WORKSPACE</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">v2.4</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Student:</span>
                <span className="text-slate-200 font-semibold">{profile.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Milestone:</span>
                <span className="text-indigo-300 truncate max-w-[130px]">{currentStageObj?.title || 'Foundations'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completion:</span>
                <span className="text-emerald-400 font-bold">{metrics.roadmapPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Row (5 metric cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* Stat 1: Goal */}
        <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.08)">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Role</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                {profile.goal}
              </h3>
              <Link to="/onboarding" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 mt-1 inline-flex items-center gap-0.5">
                Edit <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Stat 2: Streak */}
        <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.08)">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Streak</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                <CountUp end={metrics.currentStreak} duration={1000} /> days
              </h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Continuous activity
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Stat 3: Completed Topics */}
        <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.08)">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curriculum</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  <CountUp end={metrics.topicsCompleted} duration={1000} /> <span className="text-xs text-slate-400 font-normal">/ {metrics.totalTopics}</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-600">
                  <CountUp end={metrics.roadmapPercentage} suffix="%" duration={1000} />
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-1 rounded-full transition-all duration-500" style={{ width: `${metrics.roadmapPercentage}%` }} />
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Stat 4: Projects */}
        <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.08)">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projects</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderGit2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                <CountUp end={metrics.projectsCount} duration={800} />
              </h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {metrics.activeProjects} in progress
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Stat 5: Communities / Mentors */}
        <SpotlightCard className="col-span-2 sm:col-span-1 p-4" spotlightColor="rgba(99, 102, 241, 0.08)">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Network</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                <CountUp end={profile.followedCreatorIds?.length || 0} duration={800} />
              </h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Followed mentors
              </p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* 3. Main Dashboard Layout (2 Columns: Left 65%, Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* My Learning Roadmap Section */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-5">
              <Link to="/roadmap" className="flex items-center gap-2 group">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  My Learning Roadmap
                </h2>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>
              <Link 
                to="/roadmap"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View Full Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Horizontal Stepper (6 stages) */}
            <div className="relative py-2 overflow-x-auto pb-4">
              <div className="flex items-center justify-between min-w-[560px] relative">
                {/* Connecting horizontal line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                {dashboardStages.map((st) => {
                  const isCompleted = st.status === 'Completed';
                  const isInProgress = st.status === 'In Progress';

                  return (
                    <div key={st.num} className="flex flex-col items-center relative z-10 text-center px-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isInProgress
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                      </div>
                      <span className={`text-xs font-medium mt-2 max-w-[85px] leading-tight ${
                        isInProgress ? 'text-indigo-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {st.title}
                      </span>
                      <span className={`text-[10px] mt-0.5 ${
                        isCompleted ? 'text-emerald-600 font-medium' : isInProgress ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                      }`}>
                        ({st.status})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Module Card */}
            <div className="mt-4 p-5 rounded-xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Module tasks checklist (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{activeModule?.title || 'Core Foundations'}</h3>
                      <p className="text-xs text-slate-500">
                        {activeModule?.completedTasks || 0}/{activeModule?.totalTasks || 1} completed
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{activeModule?.percentage || 0}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${activeModule?.percentage || 0}%` }} />
                </div>

                <div className="space-y-2 pt-1">
                  {activeModuleTasks.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleModuleTask(t.id)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition cursor-pointer text-xs group"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                      )}
                      <span className={`${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                  {activeModuleTasks.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">All module tasks completed! Proceed to next stage.</p>
                  )}
                </div>
              </div>

              {/* Recommended resources list (5 cols) */}
              <div className="md:col-span-5 md:border-l md:border-slate-200 md:pl-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Recommended Resources</span>
                  <Link to="/resources" className="text-[11px] font-medium text-indigo-600 hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {resources.slice(0, 3).map((res, rIdx) => (
                    <a 
                      key={res.id || rIdx}
                      href={res.url || 'https://youtube.com'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-2 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/60 shadow-2xs transition group"
                    >
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-indigo-900 text-white flex items-center justify-center shrink-0">
                        <PlayCircle className="w-5 h-5 text-indigo-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">{res.title}</p>
                        <p className="text-[10px] text-slate-400">{res.creator || res.platform} • {res.duration || 'Video'}</p>
                      </div>
                    </a>
                  ))}
                  {resources.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Loading tailored resources for your path...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Top Creators + Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Creators for Your Path */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recommended Mentors for Your Path</h3>
                </div>
                <Link to="/creators" className="text-xs font-medium text-indigo-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="flex items-center justify-between pt-1 overflow-x-auto gap-2">
                {creators.slice(0, 5).map((creator) => (
                  <Link 
                    key={creator.id} 
                    to="/creators" 
                    className="flex flex-col items-center group text-center min-w-[54px]"
                  >
                    <img 
                      src={creator.avatarUrl} 
                      alt={creator.name} 
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-500 transition" 
                    />
                    <span className="text-[11px] font-medium text-slate-700 group-hover:text-indigo-600 mt-1.5 leading-tight line-clamp-1">
                      {creator.name.split(' ')[0]}
                    </span>
                  </Link>
                ))}
                <Link 
                  to="/creators"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/resources"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition text-xs font-semibold border border-slate-100"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Find Resources</span>
                </Link>

                <Link
                  to="/projects"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition text-xs font-semibold border border-slate-100"
                >
                  <Code2 className="w-4 h-4 text-purple-500" />
                  <span>New Project</span>
                </Link>

                <Link
                  to="/community"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition text-xs font-semibold border border-slate-100"
                >
                  <Users2 className="w-4 h-4 text-blue-500" />
                  <span>Join Community</span>
                </Link>

                <Link
                  to="/career"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition text-xs font-semibold border border-slate-100"
                >
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <span>Explore Jobs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Focus Card */}
          <SpotlightCard className="p-5" spotlightColor="rgba(147, 51, 234, 0.12)">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Focus</h3>
              </div>
              <Link to="/roadmap" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
                View Plan →
              </Link>
            </div>

            <div className="space-y-2">
              {focusTasks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">No active milestones for today.</p>
                  <Link to="/roadmap" className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Select a Roadmap Target →
                  </Link>
                </div>
              ) : (
                focusTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleFocus(t.id)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs group"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                    )}
                    <span className={`${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {t.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </SpotlightCard>

          {/* Ask Your AI Agent Widget */}
          <SpotlightCard className="p-5 flex flex-col justify-between" spotlightColor="rgba(99, 102, 241, 0.14)">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Student OS Co-Pilot</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Bot Message Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1">
                  Hi {profile.name}
                </p>
                <p>
                  I evaluate your roadmap progress, recommend high-signal engineering resources, and help you architect projects.
                </p>
                <p className="mt-1 font-medium text-indigo-600">
                  What would you like to work on?
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  'What should I learn next?',
                  'Find best resources for RAG',
                  'Give me a project idea',
                  'Explain this concept',
                  'Review my progress'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendPrompt(chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-medium transition cursor-pointer border border-indigo-100 active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                  placeholder="Type your message..."
                  className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:bg-white transition"
                />
              </div>
              <button 
                onClick={() => handleSendPrompt()}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition shrink-0 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>

          {/* Your Progress Card (Donut Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm font-bold text-slate-900">Your Progress</h3>
              </div>
              <Link to="/progress" className="text-xs font-semibold text-indigo-600 hover:underline">
                View Details →
              </Link>
            </div>

            <div className="flex items-center gap-5 pt-2">
              {/* Circular SVG Donut */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${metrics.roadmapPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">{metrics.roadmapPercentage}%</span>
                </div>
              </div>

              {/* Progress metric lines */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Topics Completed</span>
                  <span className="font-bold text-slate-800">{metrics.topicsCompleted} / {metrics.totalTopics}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Projects</span>
                  <span className="font-bold text-slate-800">{metrics.projectsCount}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Learning Hours</span>
                  <span className="font-bold text-slate-800">{metrics.learningHours} hrs</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Current Streak</span>
                  <span className="font-bold text-orange-600">{metrics.currentStreak} days</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-emerald-600">
                You&apos;re on track! Keep going!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Production Telemetry Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">Student OS Workspace</span>
          <span>•</span>
          <span>RAG Pipeline & Proof of Work Live</span>
        </div>
        <div className="font-mono text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
          Real Data Mode • Production Active
        </div>
      </div>
    </div>
  );
};
