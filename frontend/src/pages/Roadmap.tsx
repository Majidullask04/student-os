import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Database, 
  Sparkles, 
  FolderGit2, 
  BookOpen, 
  ExternalLink, 
  SlidersHorizontal, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle,
  Shield,
  Layers,
  FileText,
  Lock,
  ArrowRight,
  Bot
} from 'lucide-react';
import { api } from '../services/api';
import { Roadmap as RoadmapType, RoadmapModule, RoadmapTask } from '../types';
import { mockRoadmap } from '../mocks/data';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ShinyText } from '../components/ui/ShinyText';
import { CountUp } from '../components/ui/CountUp';

export const Roadmap: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapType>(mockRoadmap);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('mod-2');
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'resources' | 'notes'>('tasks');
  const [expandedTaskId, setExpandedTaskId] = useState<string>('t2-3');

  // Diagnostic Assessment State (Blueprint §8 & §9)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    api.getRoadmap().then(setRoadmap);
  }, []);

  const handleOpenQuiz = async (topic: string) => {
    setIsQuizModalOpen(true);
    setLoadingQuiz(true);
    setSelectedAnswers({});
    setQuizResult(null);
    try {
      const q = await api.generateAssessment(topic);
      setCurrentQuiz(q);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.submitAssessment(currentQuiz.topic, selectedAnswers);
      setQuizResult(res);
      if (res.passed) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
      if (res.roadmapAdapted) {
        api.getRoadmap().then(setRoadmap);
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const selectedModule: RoadmapModule = 
    roadmap.modules.find(m => m.id === selectedModuleId) || roadmap.modules[1] || roadmap.modules[0];

  const handleToggleSubTask = (taskId: string, subTaskId: string, currentCompleted: boolean) => {
    api.markTaskProgress({ taskId, subTaskId, completed: !currentCompleted }).then(res => {
      setRoadmap({ ...res.roadmap });
      if (!currentCompleted) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
    });
  };

  const handleMarkTaskComplete = (taskId: string, currentCompleted: boolean) => {
    api.markTaskProgress({ taskId, completed: !currentCompleted }).then(res => {
      setRoadmap({ ...res.roadmap });
      if (!currentCompleted) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 bg-indigo-600 rounded-full shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Roadmap
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Your personalized path to become an AI Engineer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="font-handwriting text-lg text-indigo-600 font-bold">
              &ldquo;Same student. Bigger dreams.&rdquo;
            </span>
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            Customize Roadmap
          </button>
        </div>
      </div>

      {/* 2. Top Stepper (7 Stages) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] relative px-4">
          {/* Connecting line */}
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0" />

          {roadmap.stages.map((st) => {
            const isCompleted = st.status === 'Completed';
            const isInProgress = st.status === 'In Progress';
            const isNext = st.status === 'Next';

            return (
              <div 
                key={st.id} 
                onClick={() => {
                  const mod = roadmap.modules.find(m => m.number === st.stageNumber);
                  if (mod) setSelectedModuleId(mod.id);
                }}
                className="flex flex-col items-center relative z-10 text-center px-1 cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition transform group-hover:scale-105 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isInProgress
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md'
                      : isNext
                      ? 'bg-white border-2 border-indigo-500 text-indigo-600'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.stageNumber}
                </div>
                <span className={`text-xs font-semibold mt-2 max-w-[95px] leading-tight ${
                  isInProgress ? 'text-indigo-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                }`}>
                  {st.title}
                </span>
                <span className={`text-[10px] mt-0.5 ${
                  isCompleted ? 'text-emerald-600 font-medium' : isInProgress ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                }`}>
                  {st.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Three-Column Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 cols): Roadmap Modules List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="mb-3 px-1">
              <h2 className="text-sm font-bold text-slate-900">Roadmap Modules</h2>
              <p className="text-[11px] text-slate-500">7 stages • Personalized for you</p>
            </div>

            <div className="space-y-2">
              {roadmap.modules.map((mod) => {
                const isSelected = mod.id === selectedModule.id;
                const isCompleted = mod.percentage === 100;
                const isInProgress = mod.percentage > 0 && mod.percentage < 100;

                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-2xs ring-1 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {mod.number}
                        </span>
                        <div>
                          <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {mod.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition ${isSelected ? 'text-indigo-600 rotate-90' : 'text-slate-300'}`} />
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className={isCompleted ? 'text-emerald-600 font-semibold' : isInProgress ? 'text-indigo-600 font-semibold' : 'text-slate-400'}>
                          {mod.completedTasks}/{mod.totalTasks} completed
                        </span>
                        <span className="font-bold text-slate-600">{mod.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${mod.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column (6 cols): Selected Module Detail */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
            {/* Module header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedModule.title}</h2>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedModule.percentage === 100
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : selectedModule.percentage > 0
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {selectedModule.percentage === 100 ? 'Completed' : selectedModule.percentage > 0 ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedModule.description}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                <button
                  onClick={() => handleOpenQuiz(selectedModule.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-2xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Test Skill Mastery</span>
                </button>
                <span className="text-[11px] font-semibold text-slate-500">
                  {selectedModule.completedTasks} / {selectedModule.totalTasks} completed ({selectedModule.percentage}%)
                </span>
                <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden ml-auto">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${selectedModule.percentage}%` }} />
                </div>
              </div>
            </div>

            {/* Diagnostic Skill Assessment Modal (Blueprint §8 & §9) */}
            {isQuizModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Skill Diagnostic Assessment: {currentQuiz?.topic || 'Loading...'}
                        </h3>
                        <p className="text-xs text-slate-500">Gaps automatically adapt your active roadmap with remedial modules.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setIsQuizModalOpen(false); setQuizResult(null); }}
                      className="text-slate-400 hover:text-slate-600 text-lg font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  {loadingQuiz ? (
                    <div className="py-12 text-center text-xs font-semibold text-slate-500 space-y-2">
                      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p>Generating diagnostic questions from curriculum...</p>
                    </div>
                  ) : !quizResult ? (
                    <div className="space-y-4">
                      {currentQuiz?.questions?.map((q: any, idx: number) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {q.question}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              {q.concept}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {q.options?.map((opt: string, optIdx: number) => (
                              <label
                                key={optIdx}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                  selectedAnswers[q.id] === optIdx
                                    ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-medium'
                                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  checked={selectedAnswers[q.id] === optIdx}
                                  onChange={() => {}}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setIsQuizModalOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={submittingQuiz || Object.keys(selectedAnswers).length === 0}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{submittingQuiz ? 'Evaluating Answers...' : 'Submit Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        quizResult.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div>
                          <span className={`text-[11px] font-bold block uppercase ${
                            quizResult.passed ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            Diagnostic Result
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900">
                            {quizResult.verdict}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black ${
                            quizResult.passed ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {quizResult.score}%
                          </span>
                          <span className="text-xs font-bold text-slate-500 block">
                            {quizResult.correctCount} / {quizResult.totalQuestions} correct
                          </span>
                        </div>
                      </div>

                      {/* Adaptive Remediation Notice */}
                      {quizResult.roadmapAdapted && (
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            <span>Adaptive Re-Planning Triggered!</span>
                          </div>
                          <p className="text-[11px] text-indigo-800">
                            The AI Agent automatically appended a customized remediation module: <strong>{quizResult.remediationStage?.title}</strong> to your active roadmap to reinforce {quizResult.identifiedGaps?.join(', ')}.
                          </p>
                        </div>
                      )}

                      {/* Answer Explanations */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Question Explanations:</span>
                        {quizResult.detailedResults?.map((r: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Concept: {r.concept}</span>
                              <span className={`font-semibold px-2 py-0.5 rounded-md ${
                                r.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {r.isCorrect ? '✓ Correct' : '✕ Gap'}
                              </span>
                            </div>
                            <p className="text-slate-600">{r.explanation}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => { setIsQuizModalOpen(false); setQuizResult(null); }}
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                        >
                          Back to Roadmap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 pt-3 pb-4 border-b border-slate-100">
              {[
                { id: 'tasks', label: 'Tasks', count: selectedModule.tasks.length },
                { id: 'projects', label: 'Projects', count: selectedModule.recommendedProject ? 1 : 0 },
                { id: 'resources', label: 'Resources', count: selectedModule.additionalResources?.length || 0 },
                { id: 'notes', label: 'Notes', count: undefined },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* Tasks Tab Content */}
            {activeTab === 'tasks' && (
              <div className="space-y-3 pt-3">
                {selectedModule.tasks.map((task) => {
                  const isExpanded = expandedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border transition ${
                        isExpanded
                          ? 'border-indigo-200 bg-indigo-50/20 shadow-2xs'
                          : 'border-slate-200/70 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Task Header Row */}
                      <div 
                        onClick={() => setExpandedTaskId(isExpanded ? '' : task.id)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkTaskComplete(task.id, task.completed);
                            }}
                            className="shrink-0 text-slate-400 hover:text-emerald-500 transition"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : task.inProgress ? (
                              <PlayCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          
                          <div className="truncate">
                            <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {task.title}
                            </span>
                          </div>
                        </div>

                        {/* Badges & Expand icon */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {task.type}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium hidden sm:inline-block">
                            {task.level}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.estimatedHours}h
                          </span>
                          {task.inProgress && (
                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              In Progress
                            </span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded Task Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-indigo-100/60 space-y-3.5 text-xs">
                          {task.description && (
                            <p className="text-slate-600 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Sub-tasks checklist */}
                          {task.subTasks && task.subTasks.length > 0 && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                <span>Sub-tasks ({task.subTasks.filter(s => s.completed).length} / {task.subTasks.length})</span>
                              </div>
                              <div className="space-y-1.5">
                                {task.subTasks.map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => handleToggleSubTask(task.id, sub.id, sub.completed)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                                  >
                                    {sub.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                    )}
                                    <span className={`${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Estimated Time & Dependencies */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Estimated Time</p>
                                <p className="text-xs font-bold text-slate-800">{task.estimatedHours} hours</p>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Dependencies</p>
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {task.dependencies?.join(', ') || 'None'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleMarkTaskComplete(task.id, task.completed)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                            </button>

                            <button 
                              onClick={() => setActiveTab('resources')}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition"
                            >
                              View Resources ({task.resourcesCount || 3})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="pt-3">
                {selectedModule.recommendedProject ? (
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{selectedModule.recommendedProject.title}</h4>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {selectedModule.recommendedProject.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{selectedModule.recommendedProject.description}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Start Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No project associated with this module yet.</p>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-2 pt-3">
                {selectedModule.additionalResources?.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlayCircle className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">{res.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      {res.duration || res.platform} <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3 pt-3">
                <textarea
                  rows={6}
                  placeholder="Take personal notes on this module, key commands, or concepts to remember..."
                  className="w-full text-xs text-slate-800 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 transition"
                  defaultValue={`• FastAPI uses Pydantic for request body validation and automatic OpenAPI schema generation.
• Always use async def for IO-bound endpoints (like DB queries or LLM API calls).
• Use Alembic for PostgreSQL migrations.`}
                />
                <button className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (3 cols): Explanations & AI Insights */}
        <div className="lg:col-span-3 space-y-4">
          {/* Why this step? Card */}
          <SpotlightCard className="p-5" spotlightColor="rgba(99, 102, 241, 0.12)">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Why this step?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedModule.whyThisStep || 'This module provides fundamental building blocks needed for subsequent milestones.'}
            </p>
          </SpotlightCard>

          {/* AI Agent Suggestion Card */}
          {selectedModule.aiSuggestion && (
            <SpotlightCard className="p-5 space-y-3" spotlightColor="rgba(147, 51, 234, 0.18)">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <ShinyText text="AI Agent Recommendation" className="text-xs font-bold text-slate-900" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedModule.aiSuggestion.text}
              </p>
              <button
                onClick={() => setExpandedTaskId(selectedModule.aiSuggestion?.nextTaskId || '')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
              >
                <span>Start Next Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </SpotlightCard>
          )}

          {/* Recommended Project Card */}
          {selectedModule.recommendedProject && (
            <SpotlightCard className="p-5 space-y-2" spotlightColor="rgba(16, 185, 129, 0.12)">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">Recommended Project</h3>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">{selectedModule.recommendedProject.title}</h4>
                  <span className="text-[10px] text-emerald-600 font-medium">{selectedModule.recommendedProject.badge}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {selectedModule.recommendedProject.description}
                </p>
              </div>
            </SpotlightCard>
          )}

          {/* Additional Resources list */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Additional Resources</h3>
              </div>
              <span className="text-[11px] font-medium text-indigo-600 cursor-pointer hover:underline">
                View All →
              </span>
            </div>

            <div className="space-y-2">
              {selectedModule.additionalResources?.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs transition group"
                >
                  <span className="text-slate-700 group-hover:text-indigo-600 font-medium truncate max-w-[180px]">
                    {res.title}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
