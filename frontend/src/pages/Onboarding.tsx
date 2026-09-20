import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Sparkles, 
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
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('AI Engineer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Python', 'Git', 'FastAPI', 'Docker'
  ]);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([
    'karpathy', 'kunalkushwaha', 'fireship', 'hiteshchoudhary'
  ]);
  const [timeCommitment, setTimeCommitment] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Your personal agent is building your roadmap…');

  const goals = [
    {
      id: 'AI Engineer',
      title: 'AI Engineer',
      desc: 'Build LLM apps, RAG pipelines, autonomous agents, and fine-tune models.',
      icon: Cpu,
      badge: 'High Demand'
    },
    {
      id: 'Web Developer',
      title: 'Full Stack Web Developer',
      desc: 'Master React, Next.js, Node.js, databases, and responsive modern web apps.',
      icon: Globe,
      badge: 'Evergreen'
    },
    {
      id: 'Data Scientist',
      title: 'Data Scientist / ML Engineer',
      desc: 'Explore data pipelines, feature engineering, PyTorch, and predictive analytics.',
      icon: Database,
      badge: 'Analytical'
    },
    {
      id: 'DevOps Engineer',
      title: 'DevOps & Cloud Engineer',
      desc: 'Automate CI/CD pipelines, Kubernetes, Terraform, and cloud infrastructure.',
      icon: Layers,
      badge: 'Infrastructure'
    }
  ];

  const availableSkills = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI',
    'PostgreSQL', 'SQL', 'Git', 'Docker', 'Kubernetes', 'Linux',
    'PyTorch', 'TensorFlow', 'LangChain', 'Next.js', 'MongoDB', 'AWS'
  ];

  const creators = [
    { id: 'karpathy', name: 'Andrej Karpathy', role: 'AI & Deep Learning', avatar: 'https://avatars.githubusercontent.com/u/241138?v=4' },
    { id: 'kunalkushwaha', name: 'Kunal Kushwaha', role: 'DevOps, Web & DSA', avatar: 'https://avatars.githubusercontent.com/u/42698533?v=4' },
    { id: 'fireship', name: 'Fireship', role: 'Modern Tools in 100s', avatar: 'https://avatars.githubusercontent.com/u/46283609?v=4' },
    { id: 'hiteshchoudhary', name: 'Hitesh Choudhary', role: 'Full Stack & Cloud', avatar: 'https://avatars.githubusercontent.com/u/11613311?v=4' },
    { id: 'techwithtim', name: 'Tech With Tim', role: 'Python & Software', avatar: 'https://avatars.githubusercontent.com/u/50495836?v=4' },
    { id: 'freecodecamp', name: 'freeCodeCamp', role: 'Full Comprehensive Courses', avatar: 'https://avatars.githubusercontent.com/u/9892522?v=4' },
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleCreator = (id: string) => {
    setSelectedCreators(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setLoadingText('Saving your profile and career preferences...');

    try {
      // 1. POST /profiles
      await api.saveProfile({
        goal: selectedGoal,
        targetRole: selectedGoal,
        skills: selectedSkills,
        timeCommitmentHours: timeCommitment,
        followedCreatorIds: selectedCreators,
      });

      setLoadingText('Your personal agent is analyzing your skill gaps...');
      await new Promise(r => setTimeout(r, 900));

      // 2. POST /agent/analyze
      setLoadingText('Your personal agent is building your roadmap…');
      await api.analyzeAgent({
        goal: selectedGoal,
        skills: selectedSkills,
        timeCommitmentHours: timeCommitment
      });

      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      setTimeout(() => {
        navigate('/roadmap');
      }, 700);
    } catch (err) {
      console.error(err);
      navigate('/roadmap');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
            <Bot className="w-8 h-8 animate-bounce" />
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Configuring Student OS</h3>
            <p className="text-xs text-indigo-600 font-semibold">{loadingText}</p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse-subtle" style={{ width: '85%' }} />
          </div>

          <p className="text-[11px] text-slate-400">
            Synthesizing tailored stages, high-yield resources, and milestones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Header & Progress Steps */}
      <div className="max-w-3xl w-full mx-auto space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student OS Onboarding Wizard</span>
        </div>

        {/* 3 Steps indicator */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step === s
                    ? 'bg-indigo-600 text-white shadow-md'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline-block ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
                {s === 1 ? 'Career Goal' : s === 2 ? 'Current Skills' : 'Creators & Time'}
              </span>
              {s < 3 && <div className="w-8 h-0.5 bg-slate-200 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Center Wizard Step Content */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 my-8">
        {/* Step 1: Career Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                What do you want to become?
              </h2>
              <p className="text-xs text-slate-500">
                Your roadmap and AI recommendations will be dynamically generated for this goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGoal === g.id;

                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {g.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{g.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: What do you already know? */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                What do you already know?
              </h2>
              <p className="text-xs text-slate-500">
                Select your existing skills so we can skip the basics you already know.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search or add a custom skill (e.g. FastAPI, Docker, Next.js)..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
              />
            </div>

            {/* Chip selector */}
            <div className="flex flex-wrap gap-2 pt-2">
              {availableSkills
                .filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
                .map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
            </div>

            {skillSearch.trim() && !availableSkills.map(s => s.toLowerCase()).includes(skillSearch.toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  toggleSkill(skillSearch.trim());
                  setSkillSearch('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add &ldquo;{skillSearch.trim()}&rdquo; as custom skill
              </button>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              Selected <strong>{selectedSkills.length}</strong> skills. Your roadmap will start right after your current knowledge baseline!
            </div>
          </div>
        )}

        {/* Step 3: Creators & Time Commitment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Who do you learn from?
              </h2>
              <p className="text-xs text-slate-500">
                Select your favorite educators to prioritize their content in your feeds.
              </p>
            </div>

            {/* Creators list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {creators.map((c) => {
                const isFollowed = selectedCreators.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCreator(c.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isFollowed
                        ? 'border-indigo-300 bg-indigo-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                        <p className="text-[10px] text-slate-400">{c.role}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        isFollowed ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Time Commitment Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                How much time can you commit each day?
              </label>

              <div className="grid grid-cols-4 gap-2.5">
                {[1, 2, 4, 6].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setTimeCommitment(hours)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      timeCommitment === hours
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {hours}{hours === 6 ? '+ hrs' : ' hrs'}/day
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center text-xs text-slate-400">
        <p className="font-handwriting text-base text-purple-400 font-bold">
          &ldquo;A better you is in progress. Small steps. Big future.&rdquo;
        </p>
      </div>
    </div>
  );
};
