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
  Check,
  Copy,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { mockJobs } from '../mocks/data';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ShinyText } from '../components/ui/ShinyText';
import { CountUp } from '../components/ui/CountUp';
import { GridPattern } from '../components/ui/GridPattern';
import { Magnet } from '../components/ui/Magnet';
import { DecryptedText } from '../components/ui/DecryptedText';

export const Career: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [activeTab, setActiveTab] = useState<'Jobs' | 'Internships' | 'Resume' | 'Interview Prep'>('Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [tailoringJobId, setTailoringJobId] = useState<string | null>(null);
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [interviewJobId, setInterviewJobId] = useState<string | null>(null);
  const [interviewPrepResult, setInterviewPrepResult] = useState<any>(null);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [generatingActionPlan, setGeneratingActionPlan] = useState(false);
  const [actionPlanGenerated, setActionPlanGenerated] = useState(false);

  // Paste-JD State
  const [isPasteJdOpen, setIsPasteJdOpen] = useState(false);
  const [rawJdText, setRawJdText] = useState('');
  const [jdRoleTitle, setJdRoleTitle] = useState('');
  const [jdCompany, setJdCompany] = useState('');
  const [parsingJd, setParsingJd] = useState(false);
  const [parsedJdResult, setParsedJdResult] = useState<any>(null);

  useEffect(() => {
    api.getJobs().then(setJobs);
  }, []);

  const handleParseJd = async () => {
    if (!rawJdText.trim()) return;
    setParsingJd(true);
    try {
      const res = await api.parseJdAndAdapt(rawJdText, jdRoleTitle || undefined, jdCompany || undefined);
      setParsedJdResult(res);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    } finally {
      setParsingJd(false);
    }
  };

  const handleAnalyzeJob = async (jobId: string) => {
    setAnalyzingJobId(jobId);
    try {
      const result = await api.analyzeJobFit(jobId);
      setAnalysisResult(result);
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const handleTailorApplication = async (jobId: string) => {
    setTailoringJobId(jobId);
    try {
      const result = await api.tailorApplication(jobId);
      setTailorResult(result);
    } finally {
      setTailoringJobId(null);
    }
  };

  const handlePrepareInterview = async (jobId: string) => {
    setInterviewJobId(jobId);
    try {
      const result = await api.prepareInterview(jobId);
      setInterviewPrepResult(result);
    } finally {
      setInterviewJobId(null);
    }
  };

  const handleCopyCoverLetter = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPasteJdOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Paste Job Description</span>
          </button>

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

      {/* Paste-JD Modal (Blueprint §47) */}
      {isPasteJdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Paste Job Description → Adaptive Roadmap</h3>
                  <p className="text-xs text-slate-500">Extracts required skills, evaluates 5D fit, and injects a custom sprint into your roadmap.</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsPasteJdOpen(false); setParsedJdResult(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!parsedJdResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target Role (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Platform Engineer"
                      value={jdRoleTitle}
                      onChange={(e) => setJdRoleTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Company (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Scale AI / OpenAI"
                      value={jdCompany}
                      onChange={(e) => setJdCompany(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Raw Job Description Text *</label>
                  <textarea
                    rows={6}
                    placeholder="Paste the full job posting, requirements, or responsibilities here..."
                    value={rawJdText}
                    onChange={(e) => setRawJdText(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-mono text-[11px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsPasteJdOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParseJd}
                    disabled={parsingJd || !rawJdText.trim()}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{parsingJd ? 'Extracting Skills & Adapting...' : 'Analyze Fit & Adapt Roadmap'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 block uppercase">Target Position</span>
                    <h4 className="text-base font-extrabold text-indigo-950">
                      {parsedJdResult.inferredTitle} @ {parsedJdResult.inferredCompany}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600">{parsedJdResult.matchScore}%</span>
                    <span className="text-xs font-bold text-slate-500 block">5D Fit Match</span>
                  </div>
                </div>

                {/* Extracted Skills & Gaps */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Matched Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedJdResult.matchedSkills?.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Missing Skill Gaps to Close:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedJdResult.missingSkills?.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Injected Roadmap Sprint Notification */}
                {parsedJdResult.roadmapAdapted && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Adaptive Roadmap Sprint Injected!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      A dedicated sprint with targeted learning and portfolio project tasks for <strong>{parsedJdResult.missingSkills?.join(', ')}</strong> has been appended directly to your Roadmap!
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => { setIsPasteJdOpen(false); setParsedJdResult(null); }}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                  >
                    View in Roadmap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              <SpotlightCard
                key={job.id}
                spotlightColor="rgba(99, 102, 241, 0.14)"
                className="p-5 space-y-4"
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
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
                      <CountUp to={job.matchScore} suffix="%" className="text-lg font-black text-indigo-600" />
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
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAnalyzeJob(job.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/70 hover:bg-indigo-50 rounded-xl transition"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>{analyzingJobId === job.id ? 'Evaluating 5D Fit...' : '5D Fit Analysis'}</span>
                    </button>

                    <button
                      onClick={() => handleTailorApplication(job.id)}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50/70 hover:bg-purple-50 rounded-xl transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{tailoringJobId === job.id ? 'Tailoring CV...' : 'Tailor Application'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrepareInterview(job.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                    >
                      <span>{interviewJobId === job.id ? 'Generating...' : 'Prepare Interview'}</span>
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

                {/* 5D Fit Analysis Result Drawer */}
                {analysisResult && analysisResult.jobId === job.id && (
                  <div className="mt-3 p-4 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-indigo-950 text-sm">
                          5-Dimensional Fit Evaluation ({analysisResult.matchScore || analysisResult.overallScore}%)
                        </span>
                        {analysisResult.verdictBadge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {analysisResult.verdictBadge}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setAnalysisResult(null)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 5D Dimension Grid */}
                    {analysisResult.scores && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                          <span className="text-[10px] text-slate-500 block">Technical (30%)</span>
                          <span className="text-sm font-black text-indigo-600">{analysisResult.scores.technical}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                          <span className="text-[10px] text-slate-500 block">Projects (25%)</span>
                          <span className="text-sm font-black text-indigo-600">{analysisResult.scores.experience}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                          <span className="text-[10px] text-slate-500 block">Career Goal (30%)</span>
                          <span className="text-sm font-black text-indigo-600">{analysisResult.scores.careerAlignment}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                          <span className="text-[10px] text-slate-500 block">Culture (15%)</span>
                          <span className="text-sm font-black text-indigo-600">{analysisResult.scores.behavioral}%</span>
                        </div>
                      </div>
                    )}

                    {/* Location Gate & Project Evidence */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {analysisResult.locationGate && (
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          analysisResult.locationGate === 'PASS' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Location Gate: {analysisResult.locationGate} ({analysisResult.locationNote || 'Eligible'})
                        </span>
                      )}
                      {analysisResult.projectsAsEvidence && analysisResult.projectsAsEvidence.length > 0 && (
                        <span className="text-slate-600">
                          <strong>Verified Evidence:</strong> {analysisResult.projectsAsEvidence.join(', ')}
                        </span>
                      )}
                    </div>

                    <p className="text-indigo-900 leading-relaxed pt-1 border-t border-indigo-200/60">
                      {analysisResult.recommendation}
                    </p>
                  </div>
                )}

                {/* Tailored Application Kit Drawer (/apply) */}
                {tailorResult && tailorResult.jobId === job.id && (
                  <div className="mt-3 p-4 rounded-xl bg-purple-50/90 border border-purple-200 text-xs space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-purple-950 text-sm">
                          Tailored Application Kit ({tailorResult.company})
                        </span>
                        {tailorResult.atsAnalysis && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            ATS Score: {tailorResult.atsAnalysis.atsReadinessScore}%
                          </span>
                        )}
                      </div>
                      <button onClick={() => setTailorResult(null)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tailored CV Bullets */}
                    {tailorResult.tailoredCvBullets && (
                      <div className="space-y-1.5 bg-white/80 p-3 rounded-lg border border-purple-100">
                        <span className="text-[11px] font-bold text-purple-950 block">Tailored CV Experience Bullets:</span>
                        {tailorResult.tailoredCvBullets.map((bullet: string, idx: number) => (
                          <p key={idx} className="text-slate-700 leading-relaxed font-mono text-[11px]">{bullet}</p>
                        ))}
                      </div>
                    )}

                    {/* Cover Pitch with Copy */}
                    {tailorResult.tailoredCoverLetter && (
                      <div className="space-y-1.5 bg-white/80 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-950">Tailored Cover Pitch:</span>
                          <button
                            onClick={() => handleCopyCoverLetter(tailorResult.tailoredCoverLetter)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded-md"
                          >
                            {copiedCoverLetter ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCoverLetter ? 'Copied!' : 'Copy Letter'}</span>
                          </button>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed text-[11px] max-h-36 overflow-y-auto">
                          {tailorResult.tailoredCoverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Preparation Drawer (/interview) */}
                {interviewPrepResult && interviewPrepResult.jobId === job.id && (
                  <div className="mt-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-amber-950 text-sm">
                          Interview Preparation ({interviewPrepResult.company})
                        </span>
                      </div>
                      <button onClick={() => setInterviewPrepResult(null)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Technical Deep Dives */}
                    {interviewPrepResult.technicalDeepDives && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-amber-950 block">Technical Deep Dives & Strategies:</span>
                        {interviewPrepResult.technicalDeepDives.map((t: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-white/80 border border-amber-100 space-y-1">
                            <p className="font-bold text-slate-900">{t.topic}: {t.question}</p>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              <strong className="text-amber-800">Strategy:</strong> {t.sampleAnswerStrategy}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STAR Behavioral Questions */}
                    {interviewPrepResult.behavioralStarQuestions && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-amber-950 block">STAR Behavioral Outline:</span>
                        {interviewPrepResult.behavioralStarQuestions.map((b: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-white/80 border border-amber-100 space-y-1">
                            <p className="font-bold text-slate-900">{b.question}</p>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              <strong className="text-amber-800">Your Project Story:</strong> {b.recommendedStory}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Smart Questions for the Candidate to Ask */}
                    {interviewPrepResult.smartQuestionsToAsk && (
                      <div className="p-2.5 rounded-lg bg-white/80 border border-amber-100 space-y-1">
                        <span className="text-[11px] font-bold text-amber-950 block">Smart Questions to Ask Interviewer:</span>
                        <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5">
                          {interviewPrepResult.smartQuestionsToAsk.map((q: string, idx: number) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </SpotlightCard>
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personalized 2-week Sprint Plan generated and added to your Roadmap</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
