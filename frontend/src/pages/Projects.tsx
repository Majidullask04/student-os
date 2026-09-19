import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Code2, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { GithubIcon } from '../components/ui/BrandIcons';
import { api } from '../services/api';
import { Project } from '../types';
import { mockProjects } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedTab, setSelectedTab] = useState<'All' | 'In Progress' | 'Completed' | 'Idea'>('All');
  const [suggestionTab, setSuggestionTab] = useState<'For You' | 'Trending' | 'By Skill' | 'Hackathon'>('For You');

  // AI Project Architect State (Blueprint §18)
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [architectTopic, setArchitectTopic] = useState('');
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  const handleGenerateBlueprint = async () => {
    setGeneratingBlueprint(true);
    try {
      const res = await api.generateProjectBlueprint(architectTopic || undefined);
      setGeneratedBlueprint(res);
      api.getProjects().then(setProjects);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } finally {
      setGeneratingBlueprint(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (selectedTab === 'All') return true;
    return p.status === selectedTab;
  });

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  const ideaProjects = projects.filter(p => p.status === 'Idea').length;

  const suggestions = {
    'For You': [
      {
        title: 'RAG Knowledge Search Engine',
        desc: 'Build semantic search over custom PDF datasets using ChromaDB and LangChain.',
        stack: ['Python', 'ChromaDB', 'FastAPI'],
        badge: 'Top Match'
      },
      {
        title: 'Multi-Model AI Gateway',
        desc: 'Proxy service that routes prompts between GPT-4o, Claude 3.5, and local Ollama.',
        stack: ['FastAPI', 'Redis', 'Docker'],
        badge: 'Resume Booster'
      }
    ],
    'Trending': [
      {
        title: 'Autonomous Coding Agent CLI',
        desc: 'ReAct agent that reads local files, executes shell commands, and fixes bugs.',
        stack: ['LangGraph', 'Python', 'Click'],
        badge: 'Trending 🔥'
      }
    ],
    'By Skill': [
      {
        title: 'Vector Embedding Pipeline',
        desc: 'Scale ingestion and chunking for 100k+ docs with asynchronous background queues.',
        stack: ['Celery', 'Redis', 'Python'],
        badge: 'Backend Focus'
      }
    ],
    'Hackathon': [
      {
        title: 'Autonomous Student OS Sidecar',
        desc: 'Desktop copilot that watches what you code and automatically maps skill gains.',
        stack: ['Tauri', 'Rust', 'Gemini'],
        badge: 'Hackathon Pick 🏆'
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Projects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Build real projects. Gain real skills. Show proof of work to hiring managers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => { setIsArchitectOpen(true); setGeneratedBlueprint(null); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Project Architect</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* AI Project Architect Modal (Blueprint §18) */}
      {isArchitectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Project Architect</h3>
                  <p className="text-xs text-slate-500">Designs production-grade portfolio projects grounded in your roadmap gaps.</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsArchitectOpen(false); setGeneratedBlueprint(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-mono"
              >
                ✕
              </button>
            </div>

            {!generatedBlueprint ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Skill or Gap Focus (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RAG & Vector Databases, FastAPI Concurrency, or Kubernetes"
                    value={architectTopic}
                    onChange={(e) => setArchitectTopic(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to automatically architect a project for your current roadmap milestone.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsArchitectOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateBlueprint}
                    disabled={generatingBlueprint}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{generatingBlueprint ? 'Architecting Blueprint...' : 'Generate Project Blueprint'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in text-xs">
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 block uppercase">Generated Blueprint</span>
                  <h4 className="text-base font-extrabold text-purple-950">{generatedBlueprint.title}</h4>
                  <p className="text-purple-800 leading-relaxed">{generatedBlueprint.description}</p>
                </div>

                {/* Tech Stack */}
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Recommended Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedBlueprint.techStack?.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">Step-by-Step Architecture Milestones:</span>
                  {generatedBlueprint.milestones?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <p className="font-bold text-slate-900">Step {m.step}: {m.title}</p>
                      <ul className="list-disc list-inside text-slate-600 text-[11px]">
                        {m.tasks?.map((tsk: string, tidx: number) => (
                          <li key={tidx}>{tsk}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Starter Code Snippet */}
                {generatedBlueprint.starterBoilerplate && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 block">Starter Code Skeleton:</span>
                    <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto">
                      {generatedBlueprint.starterBoilerplate}
                    </pre>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Project saved to your portfolio with status 'In Progress'!</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => { setIsArchitectOpen(false); setGeneratedBlueprint(null); }}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Content (2 Columns: Left 8 cols, Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {(['All', 'In Progress', 'Completed', 'Idea'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Project Cards */}
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition duration-150 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{project.title}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          project.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : project.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{project.description}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 self-start shrink-0">
                    {project.difficulty}
                  </span>
                </div>

                {/* Tech stack chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Progress</span>
                    <span className="font-bold text-slate-700">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>

                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Suggestions & Stats */}
        <div className="lg:col-span-4 space-y-4">
          {/* Project Stats Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Project Stats</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="text-xl font-extrabold text-slate-900 block">{totalProjects}</span>
                <span className="text-[11px] text-slate-500">Total Projects</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-center">
                <span className="text-xl font-extrabold text-emerald-600 block">{completedProjects}</span>
                <span className="text-[11px] text-emerald-700">Completed</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-center">
                <span className="text-xl font-extrabold text-indigo-600 block">{inProgressProjects}</span>
                <span className="text-[11px] text-indigo-700">In Progress</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-center">
                <span className="text-xl font-extrabold text-purple-600 block">{ideaProjects}</span>
                <span className="text-[11px] text-purple-700">Ideas</span>
              </div>
            </div>
          </div>

          {/* AI Project Suggestions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">AI Project Suggestions</h3>
            </div>

            {/* Suggestion tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['For You', 'Trending', 'By Skill', 'Hackathon'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSuggestionTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    suggestionTab === tab
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {suggestions[suggestionTab].map((sug, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">{sug.title}</h4>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {sug.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{sug.desc}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      {sug.stack.map(st => (
                        <span key={st} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {st}
                        </span>
                      ))}
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">
                      Add to Projects →
                    </button>
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
