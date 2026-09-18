import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  BrainCircuit, 
  ArrowRight,
  TrendingUp,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { mockJobs } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Career: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [activeTab, setActiveTab] = useState<'Jobs' | 'Internships' | 'Resume' | 'Interview Prep'>('Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generatingActionPlan, setGeneratingActionPlan] = useState(false);
  const [actionPlanGenerated, setActionPlanGenerated] = useState(false);

  useEffect(() => {
    api.getJobs().then(setJobs);
  }, []);

  const handleAnalyzeJob = async (jobId: string) => {
    setAnalyzingJobId(jobId);
    try {
      const result = await api.analyzeJobFit(jobId);
      setAnalysisResult(result);
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const handleGenerateActionPlan = async () => {
    setGeneratingActionPlan(true);
    await new Promise(r => setTimeout(r, 1000));
    setGeneratingActionPlan(false);
    setActionPlanGenerated(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const filteredJobs = jobs.filter(j => {
    if (activeTab === 'Internships' && j.type !== 'Internship') return false;
    if (activeTab === 'Jobs' && j.type === 'Internship') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skillsMatched.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Career Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Prepare for your dream career • Real jobs matched to your verified skills and roadmap progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['Jobs', 'Internships', 'Resume', 'Interview Prep'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or target skill..."
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none">
            <option>All Locations</option>
            <option>Remote</option>
            <option>San Francisco</option>
            <option>New York</option>
          </select>
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none">
            <option>Experience: Any</option>
            <option>Entry Level (0-2y)</option>
            <option>Mid Level (2-5y)</option>
          </select>
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none">
            <option>Salary: Any</option>
            <option>$100k+</option>
            <option>$120k+</option>
          </select>
        </div>
      </div>

      {/* 3. Main Content: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Job Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Recommended for You
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Ranked by your profile skills & completed projects
            </span>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition duration-150 space-y-4"
              >
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{job.title}</h3>
                        {job.isTopMatch && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Top Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{job.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Gauge */}
                  <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <span className="text-lg font-black text-indigo-600">{job.matchScore}%</span>
                      <span className="text-xs font-semibold text-slate-500">Fit</span>
                    </div>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${job.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills Matched & Skills to Improve */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 mr-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Skills Matched:
                    </span>
                    {job.skillsMatched.map((sm) => (
                      <span key={sm} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                        {sm}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-amber-700 mr-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-500" /> Skills to Improve:
                    </span>
                    {job.skillsToImprove.map((si) => (
                      <span key={si} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">
                        {si}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleAnalyzeJob(job.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>{analyzingJobId === job.id ? 'Analyzing...' : 'AI Gap Analysis'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
                      Prepare Interview
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                    >
                      <span>View Job</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Inline Gap Analysis Result Modal */}
                {analysisResult && analysisResult.jobId === job.id && (
                  <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        AI Agent Fit Recommendation
                      </span>
                      <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-slate-600 font-mono">×</button>
                    </div>
                    <p className="text-indigo-800 leading-relaxed">{analysisResult.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Career Readiness Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Career Readiness Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Career Readiness</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Target Role:</span>
                  <span className="text-indigo-600 font-bold">AI Engineer</span>
                </div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Roadmap Completion:</span>
                  <span className="font-bold text-slate-800">28%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              {/* Skill Coverage Breakdown */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Skill Coverage:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="font-bold block text-sm">6</span>
                    <span>Strong</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-800">
                    <span className="font-bold block text-sm">4</span>
                    <span>Moderate</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                    <span className="font-bold block text-sm">2</span>
                    <span>Missing</span>
                  </div>
                </div>
              </div>

              {/* Portfolio & Resume Readiness checks */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Portfolio Projects:</span>
                  <span className="font-bold">5 projects</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Resume Readiness:</span>
                  <span className="font-bold text-emerald-600">82%</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Interview Prep:</span>
                  <span className="font-bold text-indigo-600">3 Topics</span>
                </div>
              </div>
            </div>
          </div>

          {/* What to improve next? */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">What to improve next?</h3>
            <ol className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2 p-2 rounded-xl bg-slate-50">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-900">Vector Databases (Chroma/Pinecone)</p>
                  <p className="text-[11px] text-slate-500">Unlocks 90%+ match on 18 new AI Engineer listings.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-xl bg-slate-50">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-900">Deploy RAG to AWS or Railway</p>
                  <p className="text-[11px] text-slate-500">Provides live demo URL required by senior interviewers.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-xl bg-slate-50">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-900">Practice System Design & Rate Limiting</p>
                  <p className="text-[11px] text-slate-500">Frequently tested in technical screens.</p>
                </div>
              </li>
            </ol>

            <button
              onClick={handleGenerateActionPlan}
              disabled={generatingActionPlan}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generatingActionPlan ? 'Generating Plan...' : 'Generate Personalized Action Plan'}</span>
            </button>

            {actionPlanGenerated && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-in fade-in">
                ✓ Personalized 2-week Sprint Plan generated and added to your Roadmap!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
