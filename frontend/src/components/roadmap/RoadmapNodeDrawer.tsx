import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Award, 
  AlertTriangle, 
  Lightbulb, 
  Terminal, 
  Sparkles, 
  HelpCircle, 
  Bookmark, 
  ChevronRight,
  Flame,
  Check,
  Share2,
  Globe,
  Loader2,
  FileText,
  RefreshCw
} from 'lucide-react';
import { RoadmapNodeData, RoadmapNodeResource, QuizQuestion } from '../../data/roadmapsData';
import confetti from 'canvas-confetti';
import { useToast } from '../ui/Toast';
import { api } from '../../services/api';

interface RoadmapNodeDrawerProps {
  node: RoadmapNodeData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (nodeId: string, status: RoadmapNodeData['status']) => void;
  completedChecklist: Record<string, boolean>;
  onToggleChecklist: (nodeId: string, itemIdx: number) => void;
}

export const RoadmapNodeDrawer: React.FC<RoadmapNodeDrawerProps> = ({
  node,
  isOpen,
  onClose,
  onUpdateStatus,
  completedChecklist,
  onToggleChecklist,
}) => {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'resources' | 'challenge' | 'interview' | 'quiz'>('overview');
  
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Context.dev Real-Time Web Intelligence state
  const [liveResults, setLiveResults] = useState<Array<{ url: string; title: string; description: string; relevance: string }>>([]);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [scrapedMarkdown, setScrapedMarkdown] = useState<string | null>(null);
  const [scrapedTitle, setScrapedTitle] = useState<string>('');
  const [isScrapingLive, setIsScrapingLive] = useState<boolean>(false);

  const handleLiveSearch = async () => {
    if (!node) return;
    setIsSearchingLive(true);
    try {
      const res = await api.searchLiveEducationalContent(`${node.title} tutorial guide curriculum documentation`, 6);
      if (res.success && res.results.length > 0) {
        setLiveResults(res.results);
        success('Live Web Data Synced', `Context.dev discovered ${res.results.length} real-time educational references.`);
      } else {
        info('Search Notice', 'No live entries returned. Check backend connection.');
      }
    } catch {
      info('Search Notice', 'Could not reach Context.dev live endpoint.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleLiveScrape = async (url: string, title: string) => {
    setIsScrapingLive(true);
    setScrapedTitle(title);
    try {
      const res = await api.scrapeLiveEducationalResource(url);
      if (res.success && res.markdown) {
        setScrapedMarkdown(res.markdown);
        success('Content Extracted', 'Context.dev extracted clean reader markdown from the target URL.');
      } else {
        info('Scrape Notice', 'Unable to extract markdown for this URL.');
      }
    } catch {
      info('Scrape Notice', 'Could not complete scrape request.');
    } finally {
      setIsScrapingLive(false);
    }
  };

  if (!isOpen || !node) return null;

  const handleMarkComplete = () => {
    onUpdateStatus(node.id, 'completed');
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#059669', '#34D399', '#D97706', '#6366F1']
    });
    success('Topic Mastered! 🎉', `You completed "${node.title}". Progress recorded.`);
  };

  const handleSetFocus = () => {
    onUpdateStatus(node.id, 'in_progress');
    info('Sprint Focus Updated', `"${node.title}" is now your active focus topic.`);
  };

  const handleQuizOption = (qId: string, optIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const calculateQuizScore = () => {
    if (!node.quiz) return { correct: 0, total: 0 };
    let correct = 0;
    node.quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });
    return { correct, total: node.quiz.length };
  };

  const getDifficultyBadge = (diff: RoadmapNodeData['difficulty']) => {
    switch (diff) {
      case 'Foundational':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Core':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Senior Masterclass':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: RoadmapNodeData['status']) => {
    switch (status) {
      case 'completed':
        return { label: 'Mastered', color: 'bg-emerald-500 text-white' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-indigo-600 text-white animate-pulse-subtle' };
      case 'recommended':
        return { label: 'Recommended Next', color: 'bg-amber-500 text-white' };
      case 'optional':
        return { label: 'Optional Branch', color: 'bg-slate-200 text-slate-700' };
      default:
        return { label: 'To Learn', color: 'bg-slate-100 text-slate-600 border border-slate-200' };
    }
  };

  const statusInfo = getStatusBadge(node.status);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <aside 
        className="relative w-full max-w-2xl bg-white text-slate-900 shadow-2xl flex flex-col h-full z-10 animate-slide-up border-l border-slate-200"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(node.difficulty)}`}>
                {node.difficulty}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                ~{node.estimatedHours}h estimated
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  info(isBookmarked ? 'Bookmark Removed' : 'Topic Bookmarked', node.title);
                }}
                className={`p-2 rounded-xl transition ${isBookmarked ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Bookmark topic"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {node.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {node.tagline}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
            {node.status !== 'completed' ? (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 btn-tactile cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Mastered
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(node.id, 'to_learn')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 btn-tactile cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-700" />
                Completed (Click to Reset)
              </button>
            )}

            {node.status !== 'in_progress' && node.status !== 'completed' && (
              <button
                onClick={handleSetFocus}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 btn-tactile cursor-pointer"
              >
                <Flame className="w-4 h-4 text-indigo-600" />
                Set as Active Sprint Focus
              </button>
            )}

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  success('Link Copied', `Direct link to ${node.title} copied to clipboard.`);
                }
              }}
              className="ml-auto p-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Share topic"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-100 bg-white overflow-x-auto text-xs font-semibold text-slate-600 shrink-0">
          {[
            { id: 'overview', label: 'Senior Model', icon: Lightbulb },
            { id: 'checklist', label: `Checklist (${node.coreChecklist.length})`, icon: CheckCircle2 },
            { id: 'resources', label: `Resources (${node.resources.length})`, icon: BookOpen },
            { id: 'challenge', label: 'Challenge', icon: Terminal },
            { id: 'interview', label: 'Interview Trap', icon: AlertTriangle },
            { id: 'quiz', label: `Quiz (${node.quiz?.length || 0})`, icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Senior Mental Model */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Senior Engineer Insight Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 border border-indigo-100/80 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-700">
                      Senior Engineer Mental Model & Production Reality
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed font-sans">
                      {node.seniorMentalModel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Checklist preview */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Skills & Checkpoints
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    {node.coreChecklist.filter((_, i) => completedChecklist[`${node.id}-${i}`]).length} / {node.coreChecklist.length} checked
                  </span>
                </div>
                <div className="space-y-2">
                  {node.coreChecklist.map((item, idx) => {
                    const isChecked = Boolean(completedChecklist[`${node.id}-${idx}`]);
                    return (
                      <div 
                        key={idx}
                        onClick={() => onToggleChecklist(node.id, idx)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                          isChecked 
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </div>
                        <span className={isChecked ? 'line-through text-slate-500' : ''}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Recommended Resource */}
              {node.resources.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Recommended Reference
                  </h4>
                  <a
                    href={node.resources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {node.resources[0].title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {node.resources[0].type} • {node.resources[0].author || 'Official Reference'}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Core Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verifiable Learning Objectives</h3>
                  <p className="text-xs text-slate-500">Tick off items as you study or implement them.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {Math.round((node.coreChecklist.filter((_, i) => completedChecklist[`${node.id}-${i}`]).length / node.coreChecklist.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {node.coreChecklist.map((item, idx) => {
                  const isChecked = Boolean(completedChecklist[`${node.id}-${idx}`]);
                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleChecklist(node.id, idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium shadow-2xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <button className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600 shrink-0 transition" />
                        )}
                      </button>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                        <span className={isChecked ? 'line-through text-slate-500' : ''}>
                          {item}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Handpicked Resources */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Curated Free & High-Signal Resources</h3>
                  <p className="text-xs text-slate-500">Official documentation, industry standards, and community guides.</p>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  100% Free
                </span>
              </div>

              <div className="space-y-3">
                {node.resources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 transition shadow-2xs group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {res.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {res.type}
                          </span>
                          {res.duration && <span>⏱ {res.duration}</span>}
                          {res.author && <span>by {res.author}</span>}
                        </div>
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                  </a>
                ))}
              </div>

              {/* Context.dev Real-Time Web Intelligence Agent Section */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-linear-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 p-4 rounded-2xl border border-indigo-100/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        Live Web Scraping & Discovery (Context.dev)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Scrape the live web for the latest 2026 tutorials, deep-dive articles, and engineering docs.
                    </p>
                  </div>

                  <button
                    onClick={handleLiveSearch}
                    disabled={isSearchingLive}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all duration-300 spring-hover cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSearchingLive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning Live Web...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>Scan Fresh Web Intel</span>
                      </>
                    )}
                  </button>
                </div>

                {liveResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Real-Time Web Hits ({liveResults.length})
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                        Powered by Context.dev
                      </span>
                    </div>

                    {liveResults.map((item, idx) => (
                      <div
                        key={idx}
                        style={{ animationDelay: `${idx * 60}ms` }}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 shadow-2xs spring-hover specular-sweep animate-cascade"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5 line-clamp-1 group"
                            >
                              <span>{item.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            </a>
                            {item.description && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                                {item.url}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                Relevance: {item.relevance}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleLiveScrape(item.url, item.title)}
                            disabled={isScrapingLive}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-all spring-hover cursor-pointer shrink-0 disabled:opacity-50 border border-indigo-200 shadow-2xs"
                            title="Scrape and extract clean reader markdown with Context.dev"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Read Scraped MD</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scraped Content Reader Modal */}
                {scrapedMarkdown && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white truncate max-w-[300px]">
                          {scrapedTitle || 'Scraped Markdown View'}
                        </h4>
                      </div>
                      <button
                        onClick={() => setScrapedMarkdown(null)}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                      >
                        Close Reader
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-2 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {scrapedMarkdown.slice(0, 3000)}
                      {scrapedMarkdown.length > 3000 && '\n\n... [Content truncated for preview] ...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Practical Coding Challenge */}
          {activeTab === 'challenge' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Hands-on Portfolio Challenge</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {node.practicalChallenge.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {node.practicalChallenge.description}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Acceptance Criteria (Proof of Work)
                </h4>
                <ul className="space-y-2">
                  {node.practicalChallenge.acceptanceCriteria.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-normal">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: Interview Trap & Gotcha */}
          {activeTab === 'interview' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Common Interview Question & Trick</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  "{node.interviewTrap.question}"
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  How a Senior Engineer Answers
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {node.interviewTrap.seniorAnswer}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-red-950">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                  Common Junior Pitfall to Avoid
                </h4>
                <p className="text-xs text-red-900 leading-relaxed">
                  {node.interviewTrap.pitfallToAvoid}
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Self-Assessment Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Diagnostic Knowledge Verification</h3>
                  <p className="text-xs text-slate-500">Test your mastery of this node before moving on.</p>
                </div>
                {submittedQuiz && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Score: {calculateQuizScore().correct} / {calculateQuizScore().total}
                  </span>
                )}
              </div>

              {node.quiz && node.quiz.length > 0 ? (
                <div className="space-y-4">
                  {node.quiz.map((q, qIdx) => {
                    const selected = selectedAnswers[q.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {qIdx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        <div className="space-y-1.5 pl-7">
                          {q.options.map((opt, optIdx) => {
                            const isSelectedOpt = selected === optIdx;
                            let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60';
                            
                            if (submittedQuiz) {
                              if (optIdx === q.correctIndex) {
                                btnStyle = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                              } else if (isSelectedOpt && !isCorrect) {
                                btnStyle = 'bg-red-100 border-red-300 text-red-900';
                              }
                            } else if (isSelectedOpt) {
                              btnStyle = 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium ring-1 ring-indigo-200';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleQuizOption(q.id, optIdx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {submittedQuiz && (
                          <div className={`p-2.5 rounded-xl text-xs pl-7 ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="font-bold">{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!submittedQuiz ? (
                    <button
                      onClick={() => {
                        setSubmittedQuiz(true);
                        const score = calculateQuizScore();
                        if (score.correct === score.total) {
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                          success('Perfect Score! 🌟', 'You nailed all diagnostic questions.');
                        }
                      }}
                      disabled={Object.keys(selectedAnswers).length < node.quiz.length}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm btn-tactile cursor-pointer"
                    >
                      Submit Diagnostic Self-Check
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSubmittedQuiz(false);
                        setSelectedAnswers({});
                      }}
                      className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No diagnostic questions available for this node yet.
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
