import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Code2, 
  Cpu, 
  Globe, 
  Database, 
  Layers, 
  Search,
  ExternalLink,
  Sliders,
  Terminal,
  Compass,
  GraduationCap,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    score: number;
  }[];
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  
  // 1. Goal
  const [selectedGoal, setSelectedGoal] = useState<string>('AI Engineer');
  
  // 2. Stage & Diagnostic Baseline
  const [currentStage, setCurrentStage] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({
    q1: 2,
    q2: 2,
    q3: 2
  });

  // 3. Creators
  const [selectedCreators, setSelectedCreators] = useState<string[]>([
    'karpathy', 'fireship', 'theprimeagen', 'kunalkushwaha'
  ]);
  const [creatorSearch, setCreatorSearch] = useState('');

  // 4. Time commitment
  const [timeCommitment, setTimeCommitment] = useState<number>(2);

  // Loading state & telemetry stream
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const goals = [
    {
      id: 'AI Engineer',
      title: 'AI Engineer',
      desc: 'Build LLM apps, RAG pipelines, autonomous agents, and fine-tune models from first principles.',
      icon: Cpu,
      badge: 'High Demand',
      skills: ['Python', 'FastAPI', 'PyTorch', 'Vector DBs', 'RAG', 'LangChain', 'Docker']
    },
    {
      id: 'Web Developer',
      title: 'Full Stack Engineer',
      desc: 'Master React, Next.js, Node.js, relational databases, and high-concurrency cloud architecture.',
      icon: Globe,
      badge: 'Evergreen',
      skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Redis']
    },
    {
      id: 'Data Scientist',
      title: 'Data Scientist / ML',
      desc: 'Explore feature engineering, statistical modeling, PyTorch pipelines, and predictive analytics.',
      icon: Database,
      badge: 'Analytical',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'PyTorch', 'SQL', 'Data Pipelines']
    },
    {
      id: 'DevOps Engineer',
      title: 'DevOps & Cloud Engineer',
      desc: 'Automate CI/CD pipelines, Kubernetes, Terraform, cloud infrastructure, and observability.',
      icon: Layers,
      badge: 'Infrastructure',
      skills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'AWS', 'Go']
    }
  ];

  const stages = [
    {
      id: 'Beginner',
      title: 'Student / Absolute Beginner',
      desc: 'Starting from fundamentals. Need structured roadmaps, basic syntax, and core concepts.',
      badge: 'Foundations'
    },
    {
      id: 'Intermediate',
      title: 'Junior / Self-Taught Developer',
      desc: 'Know syntax and built basic projects. Need system design, real APIs, and production patterns.',
      badge: 'Accelerate'
    },
    {
      id: 'Advanced',
      title: 'Transitioning / Experienced Engineer',
      desc: 'Existing software experience moving into AI, distributed systems, or specialized cloud.',
      badge: 'Advanced'
    }
  ];

  const diagnosticQuestionsByGoal: Record<string, DiagnosticQuestion[]> = {
    'AI Engineer': [
      {
        id: 'q1',
        question: 'What is your current familiarity with Python and mathematical fundamentals for AI?',
        options: [
          { label: 'Basic Python syntax only (loops, functions)', level: 'Beginner', score: 1 },
          { label: 'Comfortable with NumPy arrays, vector math & matrix operations', level: 'Intermediate', score: 2 },
          { label: 'Implemented neural net gradient descent or backprop from scratch', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q2',
        question: 'How much experience do you have with Vector Embeddings and RAG architecture?',
        options: [
          { label: 'Heard of embeddings, but never created a vector database index', level: 'Beginner', score: 1 },
          { label: 'Built RAG pipelines with ChromaDB / pgvector and LangChain', level: 'Intermediate', score: 2 },
          { label: 'Architected production RAG with re-ranking, hybrid search & chunk evaluation', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q3',
        question: 'What is your backend API & autonomous agent experience?',
        options: [
          { label: 'Have not built or deployed backend REST endpoints yet', level: 'Beginner', score: 1 },
          { label: 'Built REST APIs with FastAPI / Express and integrated LLM completions', level: 'Intermediate', score: 2 },
          { label: 'Implemented ReAct tool-calling agents with structured output & error recovery', level: 'Advanced', score: 3 }
        ]
      }
    ],
    'Web Developer': [
      {
        id: 'q1',
        question: 'What is your proficiency with modern JavaScript and TypeScript?',
        options: [
          { label: 'Basic HTML, CSS, and basic JavaScript DOM scripts', level: 'Beginner', score: 1 },
          { label: 'Build interactive React components with hooks and clean state', level: 'Intermediate', score: 2 },
          { label: 'Architect full-stack TypeScript apps with SSR/SSG (Next.js App Router)', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q2',
        question: 'How do you design database schemas and backend services?',
        options: [
          { label: 'Never connected a real database to a web application', level: 'Beginner', score: 1 },
          { label: 'Designed relational schemas with PostgreSQL and ORMs (Prisma / Drizzle)', level: 'Intermediate', score: 2 },
          { label: 'Implemented JWT/OAuth auth, connection pools, and Redis caching layers', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q3',
        question: 'What is your CI/CD and deployment workflow?',
        options: [
          { label: 'Manual zip upload or run strictly on localhost', level: 'Beginner', score: 1 },
          { label: 'Automated deployments via Vercel, Supabase, or Netlify', level: 'Intermediate', score: 2 },
          { label: 'Configured Docker multi-stage builds and GitHub Actions pipelines', level: 'Advanced', score: 3 }
        ]
      }
    ],
    'Data Scientist': [
      {
        id: 'q1',
        question: 'What is your data manipulation and statistical foundation?',
        options: [
          { label: 'Basic college math and spreadsheets/Excel', level: 'Beginner', score: 1 },
          { label: 'Data wrangling & exploratory analysis with Pandas and Seaborn', level: 'Intermediate', score: 2 },
          { label: 'Statistical hypothesis testing, feature engineering, and statistical modeling', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q2',
        question: 'How do you train and evaluate Machine Learning models?',
        options: [
          { label: 'Never trained an ML model on custom data', level: 'Beginner', score: 1 },
          { label: 'Trained Scikit-learn regressions, random forests, and evaluated cross-val', level: 'Intermediate', score: 2 },
          { label: 'Trained PyTorch neural networks with custom loss functions and tensor optimization', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q3',
        question: 'What is your experience with model operationalization & MLOps?',
        options: [
          { label: 'Run code only inside Jupyter notebooks', level: 'Beginner', score: 1 },
          { label: 'Served model predictions via FastAPI or Flask endpoint', level: 'Intermediate', score: 2 },
          { label: 'Configured MLflow tracking, model registries, and Dockerized inference containers', level: 'Advanced', score: 3 }
        ]
      }
    ],
    'DevOps Engineer': [
      {
        id: 'q1',
        question: 'What is your Linux system administration and shell proficiency?',
        options: [
          { label: 'Rarely use command line terminal', level: 'Beginner', score: 1 },
          { label: 'Comfortable with bash scripting, process management, and permissions', level: 'Intermediate', score: 2 },
          { label: 'Systemd service management, networking debugging (tcpdump, iptables), and eBPF', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q2',
        question: 'How comfortable are you with Docker and Containerization?',
        options: [
          { label: 'Never written a Dockerfile', level: 'Beginner', score: 1 },
          { label: 'Written multi-stage Dockerfiles and orchestrated with Docker Compose', level: 'Intermediate', score: 2 },
          { label: 'Hardened rootless container security, layer caching, and micro-VM isolation', level: 'Advanced', score: 3 }
        ]
      },
      {
        id: 'q3',
        question: 'What is your experience with Cloud Infrastructure and Kubernetes?',
        options: [
          { label: 'No cloud provider or Kubernetes experience', level: 'Beginner', score: 1 },
          { label: 'Provisioned cloud resources on AWS/GCP and deployed to managed K8s', level: 'Intermediate', score: 2 },
          { label: 'Authored declarative Terraform HCL modules and Helm chart deployment pipelines', level: 'Advanced', score: 3 }
        ]
      }
    ]
  };

  const famousCreators = [
    {
      id: 'karpathy',
      name: 'Andrej Karpathy',
      handle: '@AndrejKarpathy',
      role: 'Founding Member OpenAI, Ex-Tesla AI Director, Eureka Labs',
      followers: '~1.69M YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/241138?v=4',
      badge: 'Zero to Hero',
      specialty: 'Transformers, nanoGPT, micrograd, first principles neural networks'
    },
    {
      id: 'theprimeagen',
      name: 'ThePrimeagen',
      handle: '@ThePrimeagen',
      role: 'Ex-Netflix Engineer, Systems & Algorithms',
      followers: '~550K YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/4198211?v=4',
      badge: 'Algorithms',
      specialty: 'Data Structures & Algorithms, Go/Rust/TypeScript, Neovim, low-level performance'
    },
    {
      id: 'fireship',
      name: 'Jeff Delaney (Fireship)',
      handle: '@fireship',
      role: 'Full Stack & AI Architecture',
      followers: '~4.28M YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/46283609?v=4',
      badge: 'In 100 Seconds',
      specialty: 'Vector DBs, RAG, Supabase, modern web frameworks, fast architecture deep-dives'
    },
    {
      id: 'georgehotz',
      name: 'George Hotz (Geohot)',
      handle: '@geohot',
      role: 'Founder comma.ai, Creator of tinygrad',
      followers: '~78K YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/72895?v=4',
      badge: 'Deep Learning Core',
      specialty: 'Building neural net frameworks from scratch, GPU kernels, raw Python engineering'
    },
    {
      id: 'kunalkushwaha',
      name: 'Kunal Kushwaha',
      handle: '@kunalstwt',
      role: 'CNCF Ambassador, Founder WeMakeDevs',
      followers: '~920K YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/42698533?v=4',
      badge: 'DevOps & Git',
      specialty: 'Docker, Kubernetes, Git/GitHub, open source contributions, career acceleration'
    },
    {
      id: 'hiteshchoudhary',
      name: 'Hitesh Choudhary',
      handle: '@hiteshcodelab',
      role: 'Founder Chai aur Code & LearnCodeOnline',
      followers: '~1.04M YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/11613311?v=4',
      badge: 'Backend Architecture',
      specialty: 'Production REST APIs, authentication, system design, Chai aur Python'
    },
    {
      id: 'rasbt',
      name: 'Sebastian Raschka',
      handle: '@sebastianraschka',
      role: 'Staff Research Scientist Lightning AI, Author LLMs from Scratch',
      followers: '~93K YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/5618407?v=4',
      badge: 'LLMs From Scratch',
      specialty: 'Step-by-step LLM implementation in PyTorch, LoRA fine-tuning, evaluation'
    },
    {
      id: 'ykilcher',
      name: 'Yannic Kilcher',
      handle: '@yannickilcher',
      role: 'AI Researcher & Paper Reviewer',
      followers: '~331K YT Subscribers',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/7464018?v=4',
      badge: 'Paper Reviews',
      specialty: 'Academic deep learning papers, Attention Is All You Need, multimodal models'
    },
    {
      id: 'freecodecamp',
      name: 'freeCodeCamp',
      handle: '@freecodecamp',
      role: 'Non-profit CS & Coding Curriculum',
      followers: '9.8M+ YouTube',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/9892522?v=4',
      badge: 'Full Courses',
      specialty: 'Comprehensive 4h+ courses in Python, FastAPI, Docker, and Web Development'
    },
    {
      id: 'techwithtim',
      name: 'Tech With Tim',
      handle: '@techwithtim',
      role: 'Software Engineer & Python Specialist',
      followers: '1.4M+ YouTube',
      platform: 'YouTube',
      avatar: 'https://avatars.githubusercontent.com/u/50495836?v=4',
      badge: 'Python Apps',
      specialty: 'Python OOP, asynchronous programming, AI APIs, portfolio software projects'
    }
  ];

  const currentQuestions = diagnosticQuestionsByGoal[selectedGoal] || diagnosticQuestionsByGoal['AI Engineer'];

  const toggleCreator = (id: string) => {
    setSelectedCreators(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setLogs([
      '[kernel:init] Bootstrapping Student OS agent environment...',
      `[profile:goal] Target career path locked: ${selectedGoal}`,
      `[diagnostic:baseline] Assessed stage: ${currentStage}`
    ]);

    try {
      // Step A: Save profile
      const activeGoalObj = goals.find(g => g.id === selectedGoal) || goals[0];
      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, '[rag:index] Ingesting creator subscriptions from YouTube & GitHub...']);

      await api.saveProfile({
        goal: selectedGoal,
        targetRole: selectedGoal,
        level: currentStage,
        skills: activeGoalObj.skills,
        timeCommitmentHours: timeCommitment,
        followedCreatorIds: selectedCreators,
        onboardingCompleted: true,
        diagnosticBaseline: diagnosticAnswers
      });

      await new Promise(r => setTimeout(r, 800));
      setLogs(prev => [...prev, '[agent:reasoning] Synthesizing customized 7-stage learning roadmap...']);

      // Step B: Trigger agent analysis
      await api.analyzeAgent({
        goal: selectedGoal,
        skills: activeGoalObj.skills,
        timeCommitmentHours: timeCommitment
      });

      await new Promise(r => setTimeout(r, 800));
      setLogs(prev => [
        ...prev, 
        '[agent:complete] Verified proof-of-work modules and career engine synced.',
        '[ready] Launching your personalized Student OS workspace...'
      ]);

      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
      setTimeout(() => {
        navigate('/roadmap');
      }, 1000);
    } catch (err) {
      console.error(err);
      navigate('/roadmap');
    }
  };

  const filteredCreators = famousCreators.filter(c => {
    if (!creatorSearch.trim()) return true;
    const q = creatorSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 bg-dot-grid-dark">
        <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                OS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Student OS Agent Kernel</h3>
                <p className="text-[11px] font-mono text-emerald-400">● Synthesizing Your Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span>v2.4</span>
            </div>
          </div>

          {/* Real-time streaming log console */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={log.includes('complete') || log.includes('ready') ? 'text-emerald-400 font-bold' : log.includes('rag') ? 'text-indigo-300' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-slate-500 animate-pulse">
              <span>_</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-1.5 rounded-full animate-pulse" style={{ width: '88%' }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Generating pgvector chunks & tools</span>
              <span>88%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 bg-dot-grid">
      {/* Header & Steps */}
      <div className="max-w-4xl w-full mx-auto space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>Student OS • Architecture Setup Wizard</span>
        </div>

        {/* 4 Steps Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2">
          {[
            { num: 1, label: 'Career Goal' },
            { num: 2, label: 'Diagnostic Baseline' },
            { num: 3, label: 'Famous Creators' },
            { num: 4, label: 'Time & Pacing' }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition font-mono ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden md:inline-block ${step === s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {s.num < 4 && <div className="w-6 sm:w-8 h-0.5 bg-slate-200 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 my-6">
        
        {/* STEP 1: CAREER GOAL */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Select Your Target Career Goal
              </h2>
              <p className="text-xs text-slate-500">
                Your autonomous agent builds all roadmaps, project blueprints, and interview prep specifically for this target.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {goals.map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-5 rounded-2xl border text-left transition relative cursor-pointer active:translate-y-[1px] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        {g.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">{g.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{g.desc}</p>

                    <div className="flex flex-wrap gap-1">
                      {g.skills.slice(0, 4).map((sk) => (
                        <span key={sk} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: STAGE & TECHNICAL DIAGNOSTIC */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Current Stage & Technical Diagnostic
              </h2>
              <p className="text-xs text-slate-500">
                Answer 3 quick baseline questions so your agent tailors roadmap starting points and eliminates redundant topics.
              </p>
            </div>

            {/* Current Stage Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                1. Where are you starting from right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stages.map((st) => {
                  const isSelected = currentStage === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setCurrentStage(st.id as any)}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer active:translate-y-[1px] ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{st.title}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{st.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Interactive Diagnostic Questions */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                2. Technical Diagnostic Questions ({selectedGoal})
              </label>

              {currentQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 mt-0.5">0{qIndex + 1}.</span>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{q.question}</h4>
                  </div>

                  <div className="space-y-1.5 pl-6">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = diagnosticAnswers[q.id] === opt.score;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => setDiagnosticAnswers(prev => ({ ...prev, [q.id]: opt.score }))}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                            isChosen
                              ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                              : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${
                            isChosen ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {opt.level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: FAMOUS CREATORS FOLLOWED */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Follow Tech Creators & Engineers
              </h2>
              <p className="text-xs text-slate-500">
                Your personal AI agent indexes real tutorials, series, and GitHub code repositories directly from these creators.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search creators by name, specialty, or platform..."
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredCreators.map((c) => {
                const isFollowed = selectedCreators.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCreator(c.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer active:translate-y-[1px] ${
                      isFollowed
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-200/90 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-md ${
                          isFollowed ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isFollowed ? 'Following' : '+ Follow'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">{c.role}</p>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-1">{c.specialty}</p>

                      <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-slate-400">
                        <span>{c.followers}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold">{c.badge}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <span>{selectedCreators.length} creators selected</span>
              <span className="text-indigo-600 font-semibold">Real YouTube & GitHub links synced to RAG</span>
            </div>
          </div>
        )}

        {/* STEP 4: TIME & PACING */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Daily Study Pacing & Commitment
              </h2>
              <p className="text-xs text-slate-500">
                Choose realistic daily hours. The agent dynamically estimates project completion dates and interview readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { hours: 1, title: 'Steady Pace', desc: '1 hour/day (~7 hrs/week). Great for working engineers or students during exam seasons.' },
                { hours: 2, title: 'Recommended', desc: '2 hours/day (~14 hrs/week). Ideal balance for comprehensive mastery and portfolio projects.' },
                { hours: 4, title: 'Intensive Sprint', desc: '4 hours/day (~28 hrs/week). Fast-track career transition within 6-8 weeks.' }
              ].map((tier) => {
                const isSelected = timeCommitment === tier.hours;
                return (
                  <button
                    key={tier.hours}
                    type="button"
                    onClick={() => setTimeCommitment(tier.hours)}
                    className={`p-5 rounded-2xl border text-left transition cursor-pointer active:translate-y-[1px] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xl font-bold text-slate-900">{tier.hours}h <span className="text-xs font-normal text-slate-500">/ day</span></span>
                      {tier.hours === 2 && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          Recommended
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{tier.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{tier.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Architecture Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>STUDENT OS ARCHITECTURE SUMMARY</span>
                <span className="text-emerald-400">READY TO BOOT</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">CAREER GOAL</span>
                  <span className="text-white font-bold">{selectedGoal}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ASSESSED STAGE</span>
                  <span className="text-white font-bold">{currentStage}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CREATORS SYNCED</span>
                  <span className="text-indigo-400 font-bold">{selectedCreators.length} Channels</span>
                </div>
                <div>
                  <span className="text-slate-500 block">WEEKLY COMMITMENT</span>
                  <span className="text-emerald-400 font-bold">{timeCommitment * 7} Hours / Wk</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer active:translate-y-[1px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:translate-y-[1px]"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer active:translate-y-[1px]"
            >
              <Terminal className="w-4 h-4" />
              <span>Initialize Student OS Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
