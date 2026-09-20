import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  FolderGit2, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { ProgressMetric, Skill } from '../types';
import { 
  mockMetrics, 
  mockSkills, 
  mockWeeklyActivity, 
  mockAchievements 
} from '../mocks/data';

export const Progress: React.FC = () => {
  const [metrics, setMetrics] = useState<ProgressMetric>(mockMetrics);
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [timeRange, setTimeRange] = useState<'This Week' | 'This Month' | 'All Time'>('This Week');

  useEffect(() => {
    api.getProgressMetrics().then(setMetrics);
  }, []);

  // Generate 16 weeks of GitHub-style heatmap squares
  const heatmapDays = Array.from({ length: 112 }, (_, i) => {
    const intensity = (i % 7 === 0 || i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : (i % 2 === 0) ? 1 : 0;
    return { day: i, intensity };
  });

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 3: return 'bg-emerald-600';
      case 2: return 'bg-emerald-400';
      case 1: return 'bg-emerald-200';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Progress
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track your learning journey, consistency, and verified skill growth.
          </p>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {(['This Week', 'This Month', 'All Time'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                timeRange === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Stat Cards with Positive Deltas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Topics Done</span>
          <div className="flex items-baseline gap-1 mt-2">
            <h3 className="text-lg font-bold text-slate-900">{metrics.topicsCompleted}</h3>
            <span className="text-xs text-slate-400">/ {metrics.totalTopics}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +6 this week
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Study Hours</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">{metrics.learningHours} hrs</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14 hrs
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Current Streak</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20 shrink-0" />
            {metrics.currentStreak} days
          </h3>
          <span className="text-[11px] font-semibold text-orange-600 mt-1 block">
            Personal best
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Roadmap %</span>
          <h3 className="text-lg font-bold text-indigo-600 mt-2">{metrics.roadmapPercentage}%</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Stage 2 active
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Projects</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">{metrics.projectsCount} total</h3>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            {metrics.activeProjects} in progress
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Skill Growth</span>
          <h3 className="text-lg font-bold text-emerald-600 mt-2">+{metrics.skillGrowthPercentage}%</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Top 10% velocity
          </span>
        </div>
      </div>

      {/* 3. Charts Row: Activity Chart + Contribution Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Learning Activity Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Learning Activity</h3>
              <p className="text-[11px] text-slate-400">Daily study hours this week</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Avg 3.2 hrs/day
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Hours Studied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (5 cols): Heatmap + "Am I on track?" */}
        <div className="lg:col-span-5 space-y-4">
          {/* Am I on track? Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-900">Am I on track?</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Yes, ahead of schedule
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                At your current pace of 3.2 hours/day, you will complete Stage 2 (Backend & APIs) in 4 days and enter AI & LLMs next week.
              </p>
            </div>
          </div>

          {/* GitHub-style Learning Heatmap */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Learning Heatmap (Jun–Sep)</h3>
              <span className="text-[10px] text-slate-400">112 days logged</span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1">
              {heatmapDays.map((d) => (
                <div
                  key={d.day}
                  className={`w-3 h-3 rounded-xs ${getHeatmapColor(d.intensity)} hover:scale-125 transition-transform cursor-pointer`}
                  title={`Day ${d.day + 1}: ${d.intensity * 1.5} hrs logged`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Skill Proficiency Bars & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Skill Proficiency Bars */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Skill Proficiency
            </h3>
            <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
              Assess New Skill →
            </span>
          </div>

          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{skill.category}</span>
                    <span className="font-bold text-indigo-600">{skill.proficiency}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): Recent Achievements & AI Summary */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Progress Summary */}
          <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/80 rounded-2xl p-5 border border-indigo-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">AI Progress Summary</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &ldquo;Majidulla, your execution over the past 12 days has been consistent and structured. Your backend fundamentals in FastAPI and PostgreSQL are crystallizing, making you ready for semantic search and vector embeddings in Stage 4.&rdquo;
            </p>

            <div className="pt-2 border-t border-indigo-200/60 space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">Recommended Next Actions:</span>
              <ol className="text-xs space-y-1 text-indigo-900 font-medium">
                <li>1. Complete the CRUD API project endpoints today.</li>
                <li>2. Watch Karpathy&apos;s &ldquo;Neural Networks: Zero to Hero&rdquo; Chapter 1 over the weekend.</li>
                <li>3. Add your Task Manager repo link to your Student OS profile.</li>
              </ol>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockAchievements.map((ach) => (
                <div key={ach.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{ach.description}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">{ach.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
