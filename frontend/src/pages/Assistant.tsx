import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Paperclip, 
  ChevronDown, 
  Cpu, 
  Clock, 
  BarChart2, 
  Target, 
  BookOpen, 
  ChevronUp, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Globe, 
  Code2, 
  GraduationCap, 
  Users2,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { YoutubeIcon } from '../components/ui/BrandIcons';
import { ToolCallCard } from '../components/ui/ToolCallCard';
import { Skeleton } from '../components/ui/Skeleton';
import { api, getDynamicFallbackProfile } from '../services/api';
import { ChatMessage, Profile, Roadmap } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

export const Assistant: React.FC = () => {
  const { success, info } = useToast();
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [profile, setProfile] = useState<Profile>(getDynamicFallbackProfile());
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isTyping, setIsTyping] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState('c-1');
  const [expandedSection, setExpandedSection] = useState<'why' | 'resources' | 'steps' | null>('why');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createWelcomeMessage = (p: Profile): ChatMessage => ({
    id: 'msg_welcome_' + Date.now(),
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Hello ${p.name}! I am your personal AI learning agent. I've analyzed your target goal of becoming a ${p.goal} and I'm ready to guide your learning roadmap, evaluate skill gaps, and prepare you for technical interviews. What would you like to work on today?`,
  });

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p);
      api.getChatHistory().then(history => {
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([createWelcomeMessage(p)]);
        }
      });
    });
    api.getRoadmap().then(setRoadmap);
  }, []);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const assistantResponse = await api.chatWithAgent(text.trim(), selectedModel);
      setMessages(prev => [...prev, assistantResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([createWelcomeMessage(profile)]);
  };

  const handleClearChats = async () => {
    await api.clearChatHistory();
    setMessages([createWelcomeMessage(profile)]);
  };

  const activeStage = roadmap?.stages?.find(s => s.status === 'In Progress' || s.status === 'Next') || roadmap?.stages?.[0];
  const activeModule = roadmap?.modules?.find(m => m.status === 'In Progress' || m.percentage < 100) || roadmap?.modules?.[0];
  const userQueries = messages.filter(m => m.sender === 'user').map(m => m.text);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <PageHeader
        title="AI Learning Agent"
        subtitle="Autonomous reasoning, roadmap synthesis, and live RAG retrieval."
        badge="Gemini 2.5 Flash • 28ms latency"
        badgeColor="indigo"
        icon={Bot}
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'AI Assistant' },
        ]}
        actions={
          <button
            onClick={() => {
              handleNewChat();
              success('New session created', 'Chat memory cleared for new exploration.');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition btn-tactile cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        }
      />

      {/* 2. Three-Column Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 cols): Chat History */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-900">Recent Prompts</h2>
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 px-2 block uppercase tracking-wider">
                This Session
              </span>
              {userQueries.slice(-8).reverse().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between group text-slate-600 hover:bg-slate-50"
                >
                  <span className="truncate max-w-[170px]">{prompt}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </button>
              ))}
              {userQueries.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-slate-400">
                  No previous prompts yet. Ask anything to start!
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleClearChats}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-600 transition px-2 py-1 w-full cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear conversation</span>
            </button>
          </div>
        </div>

        {/* Center Column (6 cols): Active Chat Thread */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col h-[750px]">
          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  {isAssistant ? (
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-indigo-500/20 select-none">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[88%] space-y-2.5 ${isAssistant ? 'text-left' : 'text-right'}`}>
                    {/* Render Structured Tool Execution Cards (assistant-ui style) */}
                    {isAssistant && msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {msg.toolCalls.map((tool, tIdx) => (
                          <ToolCallCard key={tIdx} tool={tool} />
                        ))}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block ${
                        isAssistant
                          ? 'bg-slate-50 text-slate-800 border border-slate-200/80 whitespace-pre-line'
                          : 'bg-indigo-600 text-white shadow-xs font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Rich Recommendation Card */}
                    {msg.richCard && (
                      <div className="p-4 rounded-2xl bg-white border border-indigo-200/90 shadow-sm space-y-3.5 text-left text-xs">
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {msg.richCard.title}
                              </h3>
                              <p className="text-[11px] text-slate-500">{msg.richCard.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                            {msg.richCard.badgeText}
                          </span>
                        </div>

                        {/* Tag Chips */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> 1-2 hours
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            <BarChart2 className="w-3 h-3" /> Intermediate
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            <Target className="w-3 h-3" /> High Impact
                          </span>
                        </div>

                        {/* Accordion 1: Why this recommendation? */}
                        <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                          <button
                            onClick={() => setExpandedSection(expandedSection === 'why' ? null : 'why')}
                            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
                          >
                            <span className="flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                              Technical rationale
                            </span>
                            {expandedSection === 'why' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          {expandedSection === 'why' && (
                            <div className="p-3 bg-white text-[11px] text-slate-600 leading-relaxed border-t border-slate-100">
                              {msg.richCard.whyRecommendation}
                            </div>
                          )}
                        </div>

                        {/* Accordion 2: Learning resources */}
                        <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                          <button
                            onClick={() => setExpandedSection(expandedSection === 'resources' ? null : 'resources')}
                            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                              Learning resources ({msg.richCard.learningResources.length})
                            </span>
                            {expandedSection === 'resources' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          {expandedSection === 'resources' && (
                            <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                              {msg.richCard.learningResources.map((lr, idx) => (
                                <a
                                  key={idx}
                                  href={lr.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-[11px] text-slate-800 font-medium transition group"
                                >
                                  <span className="truncate group-hover:text-indigo-600">{lr.title}</span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 ml-2">
                                    {lr.duration} <ExternalLink className="w-3 h-3" />
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Accordion 3: Next steps */}
                        <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                          <button
                            onClick={() => setExpandedSection(expandedSection === 'steps' ? null : 'steps')}
                            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Next steps
                            </span>
                            {expandedSection === 'steps' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          {expandedSection === 'steps' && (
                            <div className="p-3 bg-white space-y-1.5 border-t border-slate-100">
                              {msg.richCard.nextSteps.map((step, idx) => (
                                <p key={idx} className="text-[11px] text-slate-600 leading-relaxed">
                                  {step}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 max-w-md animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>Agent executing tools & evaluating student context...</span>
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {[
              'What should I learn today?',
              'Find best RAG resources for me',
              'Give me a project idea',
              'Review my progress',
              'Explain this concept',
              'Help me with an error'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 whitespace-nowrap transition cursor-pointer font-medium shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl space-y-2">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs focus-within:border-indigo-400 transition">
              <Paperclip className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything about your learning, career, or projects..."
                className="flex-1 text-xs text-slate-800 placeholder-slate-400 outline-none bg-transparent py-1.5"
              />

              {/* Model Selector */}
              <div className="relative border-l border-slate-200 pl-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-[11px] font-semibold text-slate-600 bg-transparent outline-none cursor-pointer pr-1"
                >
                  <option value="GPT-4o">GPT-4o</option>
                  <option value="Claude 3.5">Claude 3.5</option>
                  <option value="Gemini 1.5">Gemini 1.5</option>
                </select>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Try: &ldquo;Explain RAG&rdquo;, &ldquo;Create a study plan&rdquo;, &ldquo;Find project ideas&rdquo;, &ldquo;Review my resume&rdquo;
            </p>
          </div>
        </div>

        {/* Right Column (3 cols): Context & Profile */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Context Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Your Profile Context</h3>
              </div>
              <Link to="/onboarding" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                Edit
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Goal:</span>
                <span className="font-bold text-slate-800">{profile.goal}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Level:</span>
                <span className="font-bold text-slate-800">{profile.level}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 space-y-1">
                <span className="text-slate-500 block">Interests:</span>
                <p className="font-medium text-slate-700">{profile.interests.join(', ')}</p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Time:</span>
                <span className="font-bold text-slate-800">{profile.timeCommitmentHours} hours/day</span>
              </div>
            </div>

            {/* Skill Chips */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Active Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 5).map((sk) => (
                  <span key={sk} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {sk}
                  </span>
                ))}
                {profile.skills.length > 5 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                    +{profile.skills.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Roadmap Stage Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Current Roadmap Stage</h3>
              <Link to="/roadmap" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                View Roadmap →
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {activeStage?.stageNumber || 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{activeStage?.title || 'Foundations'}</h4>
                <p className="text-[10px] text-slate-500">{activeModule?.description || `Master core ${profile.goal} milestones`}</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${activeModule?.percentage || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1">
              {activeModule?.completedTasks || 0} / {activeModule?.totalTasks || 1} completed ({activeModule?.percentage || 0}%)
            </span>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next up:</span>
              <ol className="text-xs space-y-1 text-slate-600">
                {activeModule?.tasks?.slice(0, 4).map((t, idx) => (
                  <li key={t.id} className={idx === 0 ? "font-semibold text-indigo-600" : ""}>
                    {idx + 1}. {t.title}
                  </li>
                ))}
                {(!activeModule?.tasks || activeModule.tasks.length === 0) && (
                  <li className="text-slate-400 italic">No pending tasks in this stage.</li>
                )}
              </ol>
            </div>
          </div>

          {/* Sources Used */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Sources Used</h3>
              <span className="text-[11px] text-slate-400">View All →</span>
            </div>
            <p className="text-[11px] text-slate-500">I use information from multiple trusted sources:</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <YoutubeIcon className="w-4 h-4" />
                </div>
                <span>YouTube</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <span>Blogs</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <span>GitHub</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>Courses</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users2 className="w-4 h-4" />
                </div>
                <span>Communities</span>
              </div>
            </div>
          </div>

          {/* Inspirational Quote Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 text-center">
            <p className="text-xs text-slate-600 italic">
              &ldquo;Consistent learning today creates the opportunities of tomorrow.&rdquo;
            </p>
            <p className="text-[10px] font-semibold text-indigo-600 mt-1.5">— Student OS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
