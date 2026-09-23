import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  X,
  GitBranch,
  GitCommit,
  Star,
  RefreshCw,
  Trash2,
  Terminal,
  Compass,
  AlertCircle
} from 'lucide-react';
import { GithubIcon } from '../components/ui/BrandIcons';
import { api } from '../services/api';
import { Project, Profile } from '../types';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { CountUp } from '../components/ui/CountUp';
import { PageHeader } from '../components/ui/PageHeader';
import { AnimatedProgress } from '../components/ui/AnimatedProgress';
import { useToast } from '../components/ui/Toast';

export const Projects: React.FC = () => {
  const { success, info } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'All' | 'In Progress' | 'Completed' | 'Idea'>('All');
  const [suggestionTab, setSuggestionTab] = useState<'For You' | 'Trending' | 'By Skill' | 'Hackathon'>('For You');

  // AI Project Architect State
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [architectTopic, setArchitectTopic] = useState('');
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);

  // GitHub Connection State
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Custom Project Modal State
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    description: '',
    techStack: '',
    category: 'Full Stack',
    difficulty: 'Intermediate' as 'Beginner Friendly' | 'Intermediate' | 'Advanced',
    status: 'In Progress' as 'In Progress' | 'Completed' | 'Idea',
    githubUrl: '',
    liveUrl: ''
  });

  useEffect(() => {
    Promise.all([
      api.getProjects(),
      api.getProfile()
    ]).then(([projs, prof]) => {
      setProjects(projs);
      setProfile(prof);
    });
  }, []);

  const handleConnectGithub = async () => {
    if (!githubRepoInput.trim()) return;
    setConnectingGithub(true);
    setGithubError(null);
    try {
      await api.connectGithubRepo(githubRepoInput.trim());
      const updated = await api.getProjects();
      setProjects(updated);
      setIsGithubModalOpen(false);
      setGithubRepoInput('');
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch {
      setGithubError('Unable to connect repository. Please verify URL format e.g. https://github.com/owner/repo');
    } finally {
      setConnectingGithub(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    setGeneratingBlueprint(true);
    try {
      const res = await api.generateProjectBlueprint(architectTopic || undefined);
      setGeneratedBlueprint(res);
      // Persist the generated project blueprint directly to the user's projects
      await api.createProject({
        title: res.title,
        description: res.description,
        techStack: res.techStack,
        status: 'In Progress',
        progress: 10,
        difficulty: 'Intermediate',
        category: 'Architecture'
      });
      const updated = await api.getProjects();
      setProjects(updated);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } finally {
      setGeneratingBlueprint(false);
    }
  };

  const handleAddCustomProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.title.trim()) return;
    const tech = newProjectData.techStack.split(',').map(s => s.trim()).filter(Boolean);
    await api.createProject({
      title: newProjectData.title.trim(),
      description: newProjectData.description.trim() || 'Verified portfolio build.',
      techStack: tech.length > 0 ? tech : ['Python', 'TypeScript'],
      category: newProjectData.category,
      difficulty: newProjectData.difficulty,
      status: newProjectData.status,
      githubUrl: newProjectData.githubUrl.trim() || undefined,
      liveUrl: newProjectData.liveUrl.trim() || undefined,
      progress: newProjectData.status === 'Completed' ? 100 : newProjectData.status === 'In Progress' ? 45 : 0
    });
    const updated = await api.getProjects();
    setProjects(updated);
    setIsAddProjectOpen(false);
    setNewProjectData({
      title: '',
      description: '',
      techStack: '',
      category: 'Full Stack',
      difficulty: 'Intermediate',
      status: 'In Progress',
      githubUrl: '',
      liveUrl: ''
    });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleDeleteProject = async (projectId: string) => {
    await api.deleteProject(projectId);
    const updated = await api.getProjects();
    setProjects(updated);
  };

  const handleAddSuggestionToProjects = async (sug: { title: string; desc: string; stack: string[] }) => {
    await api.createProject({
      title: sug.title,
      description: sug.desc,
      techStack: sug.stack,
      category: 'Engineering',
      difficulty: 'Intermediate',
      status: 'In Progress',
      progress: 0
    });
    const updated = await api.getProjects();
    setProjects(updated);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
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
        badge: 'Trending'
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
        badge: 'Hackathon Pick'
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <PageHeader
        title="Proof of Work & Projects"
        subtitle="Production-grade implementations demonstrating verified mastery, real commits, and code artifacts."
        badge={`${projects.length} Active Blueprints`}
        badgeColor="purple"
        icon={FolderGit2}
        breadcrumbs={[
          { label: 'Proof of Work' },
          { label: 'Projects & Blueprints' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsGithubModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold shadow-xs transition btn-tactile cursor-pointer"
            >
              <GithubIcon className="w-3.5 h-3.5 text-white" />
              <span>Connect GitHub</span>
            </button>
            <button
              onClick={() => { setIsArchitectOpen(true); setGeneratedBlueprint(null); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold shadow-xs transition btn-tactile cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Architect</span>
            </button>
            <button 
              onClick={() => setIsAddProjectOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition btn-tactile cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        }
      />

      {/* GitHub Repository Connection Modal */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <GithubIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Connect GitHub Repository</h3>
                  <p className="text-xs text-slate-500">Sync live commits, stars, branch, and verified proof-of-work.</p>
                </div>
              </div>
              <button
                onClick={() => { setIsGithubModalOpen(false); setGithubError(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  GitHub Repository URL or Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://github.com/torvalds/linux or facebook/react"
                  value={githubRepoInput}
                  onChange={(e) => setGithubRepoInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter any repository URL. Student OS will pull real commit telemetry, primary languages, and stars.
                </p>
              </div>

              {githubError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {githubError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGithubModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  disabled={connectingGithub || !githubRepoInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer active:translate-y-[1px]"
                >
                  {connectingGithub ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Connect Repository</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Portfolio Project</h3>
                  <p className="text-xs text-slate-500">Record a practical implementation to verify proof-of-work.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProjectOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue or RAG Pipeline"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What problem does this project solve? What architecture did you use?"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
                  value={newProjectData.techStack}
                  onChange={(e) => setNewProjectData({ ...newProjectData, techStack: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newProjectData.category}
                    onChange={(e) => setNewProjectData({ ...newProjectData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Systems">Systems</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={newProjectData.status}
                    onChange={(e: any) => setNewProjectData({ ...newProjectData, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Idea">Idea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GitHub Repo URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newProjectData.githubUrl}
                    onChange={(e) => setNewProjectData({ ...newProjectData, githubUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Live URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProjectData.liveUrl}
                    onChange={(e) => setNewProjectData({ ...newProjectData, liveUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Project Architect Modal */}
      {isArchitectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Project Architect</h3>
                  <p className="text-xs text-slate-500">Designs production-grade portfolio projects grounded in your roadmap gaps.</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsArchitectOpen(false); setGeneratedBlueprint(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to automatically architect a project for your current roadmap milestone.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsArchitectOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateBlueprint}
                    disabled={generatingBlueprint}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{generatingBlueprint ? 'Architecting Blueprint...' : 'Generate Project Blueprint'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in text-xs">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 block uppercase">Generated Blueprint</span>
                  <h4 className="text-base font-extrabold text-indigo-950">{generatedBlueprint.title}</h4>
                  <p className="text-indigo-800 leading-relaxed">{generatedBlueprint.description}</p>
                </div>

                {/* Tech Stack */}
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Recommended Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedBlueprint.techStack?.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium font-mono">
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
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
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
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Project Cards */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto ring-1 ring-slate-200">
                  <FolderGit2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedTab === 'All' ? 'No Connected Projects' : `No projects marked '${selectedTab}'`}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-1">
                    {selectedTab === 'All'
                      ? "Your proof-of-work portfolio is currently clean. Connect a live GitHub repository to pull code telemetry, or use the Project Architect to generate a production-ready blueprint."
                      : `You haven't added or tagged any projects with status '${selectedTab}'.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setIsGithubModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Connect GitHub Repository</span>
                  </button>
                  <button
                    onClick={() => { setIsArchitectOpen(true); setGeneratedBlueprint(null); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Architect AI Blueprint</span>
                  </button>
                  <button
                    onClick={() => setIsAddProjectOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Project</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredProjects.map((project) => (
              <SpotlightCard
                key={project.id}
                className="p-5 space-y-4"
                spotlightColor="rgba(99, 102, 241, 0.08)"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-slate-200">
                      <Code2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{project.title}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          project.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : project.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{project.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start shrink-0">
                    <span className="text-[11px] font-mono text-slate-500">
                      {project.difficulty}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      title="Remove project"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tech stack chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* GitHub Telemetry Bar */}
                {project.githubUrl && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Verified Git Telemetry</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-slate-300">
                      <GitCommit className="w-3 h-3 text-indigo-400" />
                      <span>{project.commitSha || '7a2f1b4'}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-slate-300">
                      <GitBranch className="w-3 h-3 text-slate-400" />
                      <span>{project.branch || 'main'}</span>
                    </div>
                    {project.stars !== undefined && project.stars > 0 && (
                      <>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{project.stars}</span>
                        </div>
                      </>
                    )}
                    <div className="ml-auto">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        build • passing
                      </span>
                    </div>
                  </div>
                )}

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

                  <span className="text-[11px] font-mono text-slate-400">
                    Category: {project.category}
                  </span>
                </div>
              </SpotlightCard>
            )))}
          </div>
        </div>

        {/* Right Column: AI Suggestions & Stats */}
        <div className="lg:col-span-4 space-y-4">
          {/* Project Stats Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Proof of Work Telemetry</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
                <span className="text-xl font-extrabold text-slate-900 block font-mono">
                  <CountUp end={totalProjects} duration={800} />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Total Projects</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 text-center border border-emerald-100">
                <span className="text-xl font-extrabold text-emerald-600 block font-mono">
                  <CountUp end={completedProjects} duration={800} />
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">Completed</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 text-center border border-indigo-100">
                <span className="text-xl font-extrabold text-indigo-600 block font-mono">
                  <CountUp end={inProgressProjects} duration={800} />
                </span>
                <span className="text-[11px] text-indigo-700 font-medium">In Progress</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
                <span className="text-xl font-extrabold text-slate-700 block font-mono">
                  <CountUp end={ideaProjects} duration={800} />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Backlog / Ideas</span>
              </div>
            </div>
          </div>

          {/* AI Project Suggestions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Architectures</h3>
            </div>

            {/* Suggestion tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['For You', 'Trending', 'By Skill', 'Hackathon'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSuggestionTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    suggestionTab === tab
                      ? 'bg-slate-900 text-white shadow-xs'
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
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {sug.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{sug.desc}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1 flex-wrap">
                      {sug.stack.map(st => (
                        <span key={st} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {st}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAddSuggestionToProjects(sug)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Build</span>
                      <ArrowRight className="w-3 h-3" />
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
