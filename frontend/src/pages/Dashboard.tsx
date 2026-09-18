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
  Sparkles,
  Code2,
  Briefcase,
  Layers,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { mockProfile, mockCreators, mockResources, mockRoadmap } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(mockProfile);
  const [focusTasks, setFocusTasks] = useState([
    { id: '1', text: 'Complete FastAPI tutorial', completed: false },
    { id: '2', text: 'Watch Karpathy video (Agents)', completed: true },
    { id: '3', text: 'Update project README', completed: false },
    { id: '4', text: 'Practice DSA (30 mins)', completed: false },
  ]);

  const [activeModuleTasks, setActiveModuleTasks] = useState([
    { id: 'amt-1', title: 'Learn HTTP & REST APIs', completed: true },
    { id: 'amt-2', title: 'Set up FastAPI project', completed: true },
    { id: 'amt-3', title: 'Authentication with JWT', completed: false },
    { id: 'amt-4', title: 'Connect to PostgreSQL', completed: false },
    { id: 'amt-5', title: 'Build a small CRUD app', completed: false },
  ]);

  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  const handleToggleFocus = (id: string) => {
    setFocusTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleToggleModuleTask = (id: string) => {
    setActiveModuleTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
        }
        api.markTaskProgress({ taskId: id, completed: nextState });
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleSendPrompt = (promptText?: string) => {
    const text = promptText || chatInput;
    if (!text.trim()) return;
    navigate(`/assistant?prompt=${encodeURIComponent(text.trim())}`);
  };

  // 6 Stages for Dashboard Stepper
  const dashboardStages = [
    { num: 1, title: 'Foundations', status: 'Completed' },
    { num: 2, title: 'Backend & APIs', status: 'In Progress' },
    { num: 3, title: 'AI & LLMs', status: 'Next' },
    { num: 4, title: 'Build Projects', status: 'Upcoming' },
    { num: 5, title: 'Deploy & DevOps', status: 'Upcoming' },
    { num: 6, title: 'Career & Jobs', status: 'Upcoming' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-blue-50/60 border border-indigo-100/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Good morning, {profile.name}! <span className="inline-block animate-bounce">☀️</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
              Your personal AI agent is here to guide you.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100/90 shadow-2xs text-xs font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>&ldquo;Discipline today, freedom tomorrow.&rdquo;</span>
            </div>
          </div>

          {/* Character graphic & handwritten motivation */}
          <div className="flex items-center gap-4 self-end md:self-center shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-handwriting text-xl text-indigo-700 font-bold -rotate-2">
                Same student.
              </p>
              <p className="font-handwriting text-2xl text-purple-700 font-extrabold -rotate-1">
                Bigger dreams.
              </p>
            </div>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md ring-4 ring-white/80 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" 
                alt="Student graphic" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Row (5 metric cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Stat 1: Goal */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">My Goal</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none truncate">
              {profile.goal}
            </h3>
            <Link to="/onboarding" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 mt-1.5 inline-flex items-center gap-0.5">
              Change Goal <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-orange-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Learning Streak</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              12 days
            </h3>
            <p className="text-[11px] font-medium text-orange-600 mt-1.5 flex items-center gap-1">
              Keep it going! 🔥
            </p>
          </div>
        </div>

        {/* Stat 3: Completed Topics */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-emerald-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Topics</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                28 <span className="text-xs text-slate-400 font-normal">/ 120</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600">23%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '23%' }} />
            </div>
          </div>
        </div>

        {/* Stat 4: Projects */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Projects</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              5
            </h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1.5">
              3 in progress
            </p>
          </div>
        </div>

        {/* Stat 5: Communities */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Communities</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              12
            </h3>
            <p className="text-[11px] font-medium text-indigo-600 mt-1.5 flex items-center gap-1">
              Active
            </p>
          </div>
        </div>
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

            {/* Active Module Card (Backend & APIs) */}
            <div className="mt-4 p-5 rounded-xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Module tasks checklist (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Backend & APIs</h3>
                      <p className="text-xs text-slate-500">3/8 completed</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">38%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: '38%' }} />
                </div>

                <div className="space-y-2 pt-1">
                  {activeModuleTasks.map((t) => (
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
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/60 shadow-2xs transition group"
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">FastAPI Full Course</p>
                      <p className="text-[10px] text-slate-400">freeCodeCamp • 3:12:00</p>
                    </div>
                  </a>

                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/60 shadow-2xs transition group"
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-blue-700 text-white flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5 text-blue-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">PostgreSQL for Beginners</p>
                      <p className="text-[10px] text-slate-400">Fireship • 45:20</p>
                    </div>
                  </a>

                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/60 shadow-2xs transition group"
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-indigo-900 text-white flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">JWT Authentication in FastAPI</p>
                      <p className="text-[10px] text-slate-400">Tech With Tim • 28:10</p>
                    </div>
                  </a>
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
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Top Creators for Your Path</h3>
                </div>
                <Link to="/creators" className="text-xs font-medium text-indigo-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="flex items-center justify-between pt-1 overflow-x-auto gap-2">
                {mockCreators.map((creator) => (
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
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
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
              {focusTasks.map((t) => (
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
              ))}
            </div>
          </div>

          {/* Ask Your AI Agent Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Ask Your AI Agent</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Bot Message Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <span>Hi {profile.name}! 👋</span>
                </p>
                <p>
                  I&apos;m your personal AI study agent. I can help you with learning, career guidance, resources, project ideas, and more.
                </p>
                <p className="mt-1.5 font-medium text-indigo-600">
                  What would you like to do today?
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
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-medium transition cursor-pointer border border-indigo-100"
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
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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
                    strokeDasharray="28, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">28%</span>
                </div>
              </div>

              {/* Progress metric lines */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Topics Completed</span>
                  <span className="font-bold text-slate-800">28 / 120</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Projects</span>
                  <span className="font-bold text-slate-800">5</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Learning Hours</span>
                  <span className="font-bold text-slate-800">42 hrs</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Current Streak</span>
                  <span className="font-bold text-orange-600">12 days</span>
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

      {/* Bottom Motivation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/60 via-indigo-50/50 to-blue-50/60 border border-indigo-100/60 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
        <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
          &ldquo;The best time to start was yesterday. The next best time is now.&rdquo;
        </p>
        <div className="font-handwriting text-lg sm:text-xl font-bold text-indigo-700 tracking-wide">
          Build Skills · Build Your Future
        </div>
      </div>
    </div>
  );
};
