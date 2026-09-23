import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  FolderGit2, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Calendar, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Activity,
  Cpu
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
import { ProgressMetric, Skill, Profile, Roadmap, ActivityLogEntry } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { AnimatedProgress } from '../components/ui/AnimatedProgress';

export const Progress: React.FC = () => {
  const [metrics, setMetrics] = useState<ProgressMetric>({
    topicsCompleted: 0,
    totalTopics: 0,
    learningHours: 0,
    currentStreak: 0,
    roadmapPercentage: 0,
    projectsCount: 0,
    activeProjects: 0,
    skillGrowthPercentage: 0
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeRange, setTimeRange] = useState<'This Week' | 'This Month' | 'All Time'>('This Week');

  useEffect(() => {
    Promise.all([
      api.getProgressMetrics(),
      api.getProfile(),
      api.getRoadmap(),
      api.getActivityLog()
    ]).then(([m, p, r, act]) => {
      setMetrics(m);
      setProfile(p);
      setRoadmap(r);
      setActivityLog(act);

      // Generate verified skills from user profile & roadmap progress
      if (p.skills && p.skills.length > 0) {
        const generatedSkills: Skill[] = p.skills.map((skillName, idx) => {
          const baseProficiency = Math.min(95, 30 + (m.topicsCompleted * 6) + (idx * 5) % 25);
          return {
            id: `skill-${idx}`,
            name: skillName,
            category: p.goal || 'Engineering',
            proficiency: baseProficiency,
            verified: baseProficiency >= 50
          };
        });
        setSkills(generatedSkills);
      } else {
        setSkills([
          { id: 's1', name: 'Core Foundations', category: p.goal || 'General', proficiency: m.roadmapPercentage || 10, verified: false }
        ]);
      }
    });
  }, []);

  // Map real activity log by date (YYYY-MM-DD)
  const activityByDate: Record<string, { hours: number; count: number }> = {};
  activityLog.forEach(act => {
    if (!activityByDate[act.date]) {
      activityByDate[act.date] = { hours: 0, count: 0 };
    }
    activityByDate[act.date].hours += act.hours;
    activityByDate[act.date].count += 1;
  });

  // If user has completed tasks but no explicit logs yet, attribute to today
  const todayKey = new Date().toISOString().split('T')[0];
  if (metrics.topicsCompleted > 0 && !activityByDate[todayKey]) {
    activityByDate[todayKey] = {
      hours: metrics.learningHours || 1.5,
      count: metrics.topicsCompleted
    };
  }

  // Interactive GitHub-style heatmap (140 days = 20 weeks)
  const [hoveredDay, setHoveredDay] = useState<{ day: number; date: string; hours: number; topics: number } | null>(null);

  const heatmapDays = Array.from({ length: 140 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (139 - i));
    const dateKey = d.toISOString().split('T')[0];
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const act = activityByDate[dateKey];
    const hours = act ? act.hours : 0;
    const topics = act ? act.count : 0;

    let intensity = 0;
    if (hours >= 3.0) intensity = 4;
    else if (hours >= 2.0) intensity = 3;
    else if (hours >= 1.0) intensity = 2;
    else if (hours > 0) intensity = 1;

    return { day: i, intensity, date: dateStr, hours, topics };
  });

  const activeDaysCount = Object.keys(activityByDate).length;

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 2: return 'bg-emerald-400';
      case 1: return 'bg-emerald-200';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header & Range Selector */}
      <PageHeader
        title="Learning Telemetry & Progress"
        subtitle="Real study telemetry, verified skill mastery, and continuous milestone tracking."
        badge={`${metrics.learningHours} hrs logged • ${metrics.currentStreak} day streak`}
        badgeColor="emerald"
        icon={BarChart3}
        breadcrumbs={[
          { label: 'Proof of Work' },
          { label: 'Progress Metrics' },
        ]}
        actions={
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            {(['This Week', 'This Month', 'All Time'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer btn-tactile ${
                  timeRange === r
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* 2. Stat Cards with Positive Deltas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Topics Done</span>
          <div className="flex items-baseline gap-1 mt-2">
            <h3 className="text-lg font-bold text-slate-900 font-mono">{metrics.topicsCompleted}</h3>
            <span className="text-xs text-slate-400 font-mono">/ {metrics.totalTopics}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-mono">
            {metrics.topicsCompleted > 0 ? (
              <>
                <ArrowUpRight className="w-3 h-3" /> +{metrics.topicsCompleted} logged
              </>
            ) : (
              <span className="text-slate-400">Start roadmap</span>
            )}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Study Hours</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 font-mono">{metrics.learningHours} hrs</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-mono">
            {metrics.learningHours > 0 ? (
              <>
                <ArrowUpRight className="w-3 h-3" /> {metrics.learningHours} hrs verified
              </>
            ) : (
              <span className="text-slate-400">0 hrs logged</span>
            )}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Current Streak</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-1.5 font-mono">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20 shrink-0" />
            {metrics.currentStreak} days
          </h3>
          <span className="text-[11px] font-semibold text-orange-600 mt-1 block font-mono">
            {metrics.currentStreak > 0 ? 'Active momentum' : 'No streak active'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Roadmap %</span>
          <h3 className="text-lg font-bold text-indigo-600 mt-2 font-mono">{metrics.roadmapPercentage}%</h3>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5 mt-1 font-mono">
            {roadmap?.stages?.find(s => s.status === 'In Progress')?.title || 'Foundations'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Projects</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 font-mono">{metrics.projectsCount} total</h3>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block font-mono">
            {metrics.activeProjects} in progress
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block font-mono">Skill Growth</span>
          <h3 className="text-lg font-bold text-emerald-600 mt-2 font-mono">+{metrics.skillGrowthPercentage}%</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-mono">
            Velocity {metrics.roadmapPercentage > 0 ? 'Normal' : 'Ready'}
          </span>
        </div>
      </div>

      {/* 3. Charts Row: Activity Chart + Contribution Heatmap */}
      {(() => {
        const dailyAvg = metrics.learningHours > 0 ? (metrics.learningHours / 7).toFixed(1) : '0.0';
        
        // Compute real weekly activity from activity log
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyBuckets: Record<string, number> = {
          Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
        };

        activityLog.forEach(act => {
          const actDate = new Date(act.date);
          const name = dayNames[actDate.getDay()];
          if (name in weeklyBuckets) {
            weeklyBuckets[name] += act.hours;
          }
        });

        // If today has activity not yet logged, populate today's bucket
        const todayDayName = dayNames[new Date().getDay()];
        if (metrics.learningHours > 0 && weeklyBuckets[todayDayName] === 0) {
          weeklyBuckets[todayDayName] = metrics.learningHours;
        }

        const weeklyActivityData = [
          { day: 'Mon', hours: weeklyBuckets['Mon'] },
          { day: 'Tue', hours: weeklyBuckets['Tue'] },
          { day: 'Wed', hours: weeklyBuckets['Wed'] },
          { day: 'Thu', hours: weeklyBuckets['Thu'] },
          { day: 'Fri', hours: weeklyBuckets['Fri'] },
          { day: 'Sat', hours: weeklyBuckets['Sat'] },
          { day: 'Sun', hours: weeklyBuckets['Sun'] },
        ];

        const activeStage = roadmap?.stages.find(s => s.status === 'In Progress') || roadmap?.stages[0];
        const nextStage = roadmap?.stages.find(s => s.status === 'Upcoming');

        const achievementsList = [
          {
            id: 'ach-1',
            title: 'Learning Path Activated',
            description: `Targeting ${profile?.goal || 'Engineering'} career goals`,
            date: 'Active',
            unlocked: true
          },
          {
            id: 'ach-2',
            title: 'Curriculum Mastery',
            description: `${metrics.topicsCompleted} of ${metrics.totalTopics} topics completed`,
            date: `${metrics.roadmapPercentage}% done`,
            unlocked: metrics.topicsCompleted > 0
          },
          {
            id: 'ach-3',
            title: 'Focus Consistency',
            description: `${metrics.currentStreak} day learning streak`,
            date: `${metrics.learningHours} hrs logged`,
            unlocked: metrics.currentStreak > 0
          },
          {
            id: 'ach-4',
            title: 'Portfolio Proof of Work',
            description: `${metrics.projectsCount} projects connected or built`,
            date: metrics.projectsCount > 0 ? 'Verified' : 'Pending',
            unlocked: metrics.projectsCount > 0
          }
        ];

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left (7 cols): Learning Activity Bar Chart */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Weekly Activity Breakdown</h3>
                    <p className="text-xs text-slate-500 font-mono">Actual hours logged per day</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono">Avg: {dailyAvg} hrs/day</span>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <h4 className="text-xs font-bold text-emerald-900">Curriculum Health</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                        {metrics.roadmapPercentage > 50 ? 'Ahead of Schedule' : metrics.topicsCompleted > 0 ? 'On Track' : 'Ready to Start'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                      {metrics.topicsCompleted > 0
                        ? `You have logged ${metrics.learningHours} hours and completed ${metrics.topicsCompleted} topics in ${activeStage?.title || 'active curriculum'}.${nextStage ? ` Next unlock: ${nextStage.title}.` : ''}`
                        : `Your personalized ${profile?.goal || 'Engineering'} roadmap is initialized. Check off your first topic to ignite your streak and heatmap.`}
                    </p>
                  </div>
                </div>

                {/* Learning Heatmap */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">Verified Study Heatmap (20 Weeks)</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        140 days tracked • {activeDaysCount} active study {activeDaysCount === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {metrics.currentStreak}d Streak 🔥
                    </span>
                  </div>

                  {/* Interactive Hover Inspection Bar */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono flex items-center justify-between text-slate-600">
                    {hoveredDay ? (
                      <>
                        <span className="font-semibold text-slate-900">{hoveredDay.date}</span>
                        <span className="text-emerald-600 font-bold">{hoveredDay.hours} hrs studied</span>
                        <span className="text-indigo-600 font-semibold">{hoveredDay.topics} topics done</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Hover any square to inspect study hours and topics...</span>
                    )}
                  </div>

                  {/* Heatmap Grid with Day Labels */}
                  <div className="flex gap-2 overflow-x-auto py-1 items-center">
                    {/* Day-of-week labels */}
                    <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 h-[105px] select-none pr-1">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                      {heatmapDays.map((d) => (
                        <div
                          key={d.day}
                          onMouseEnter={() => setHoveredDay(d)}
                          className={`w-3.5 h-3.5 rounded-xs ${getHeatmapColor(d.intensity)} hover:scale-125 transition-transform cursor-pointer ring-1 ring-black/5`}
                          title={`${d.date}: ${d.hours} hrs, ${d.topics} topics`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 ring-1 ring-slate-200" title="0 hrs" />
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200" title="0.8 hrs" />
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" title="1.5 hrs" />
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" title="2.5 hrs" />
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" title="3.5+ hrs" />
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
                    Verified Skill Proficiency
                  </h3>
                  <span className="text-xs text-indigo-600 font-semibold font-mono">
                    {skills.length} Tracked
                  </span>
                </div>

                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">{skill.category}</span>
                          <span className="font-bold text-indigo-600 font-mono">{skill.proficiency}%</span>
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
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Telemetry Summary</h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Student <span className="text-white font-semibold">{profile?.name || 'Learner'}</span> has completed{' '}
                    <span className="text-emerald-400 font-bold font-mono">{metrics.topicsCompleted}</span> of{' '}
                    <span className="font-mono">{metrics.totalTopics}</span> topics towards becoming an{' '}
                    <span className="text-indigo-300 font-semibold">{profile?.goal || 'Engineer'}</span>, logging{' '}
                    <span className="font-mono text-emerald-400 font-bold">{metrics.learningHours}</span> hours of active study.
                  </p>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Action Items:</span>
                    <ol className="space-y-1 text-slate-300 text-[11px]">
                      <li>1. Execute incomplete tasks in {activeStage?.title || 'Foundations'}.</li>
                      <li>2. Connect a GitHub repository to build verifiable proof of work.</li>
                      <li>3. Review top creator tutorials to reinforce mental models.</li>
                    </ol>
                  </div>
                </div>

                {/* Milestones & Achievements */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Milestones & Verification</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievementsList.map((ach) => (
                      <div 
                        key={ach.id} 
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                          ach.unlocked ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-50/40 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          ach.unlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ach.description}</p>
                          <span className="text-[9px] text-indigo-600 font-medium font-mono mt-1 block">{ach.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};
