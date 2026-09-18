import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Paperclip, 
  ChevronDown, 
  Sparkles, 
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
  ChevronRight
} from 'lucide-react';
import { YoutubeIcon } from '../components/ui/BrandIcons';
import { api } from '../services/api';
import { ChatMessage, Profile } from '../types';
import { mockProfile, mockInitialMessages, mockChatHistory } from '../mocks/data';

export const Assistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialMessages);
  const [inputText, setInputText] = useState('');
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isTyping, setIsTyping] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState('c-1');
  const [expandedSection, setExpandedSection] = useState<'why' | 'resources' | 'steps' | null>('why');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    api.getProfile().then(setProfile);
    api.getChatHistory().then(setMessages);
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
    setMessages([mockInitialMessages[0]]);
  };

  const handleClearChats = () => {
    setMessages([mockInitialMessages[0]]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your AI Learning Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Get personalized guidance, resources, and solutions for your learning journey.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <span className="font-handwriting text-lg text-indigo-600 font-bold">
              &ldquo;Same student. Bigger dreams.&rdquo;
            </span>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Column Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 cols): Chat History */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-900">Chat History</h2>
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {['Today', 'Yesterday', 'Last 7 days'].map((group) => {
              const items = mockChatHistory.filter(h => h.group === group);
              if (items.length === 0) return null;

              return (
                <div key={group} className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 px-2 block uppercase tracking-wider">
                    {group}
                  </span>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveHistoryId(item.id);
                        handleSendMessage(item.title);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between group ${
                        activeHistoryId === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate max-w-[150px]">{item.title}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-500 shrink-0">
                        {item.time}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleClearChats}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-600 transition px-2 py-1 w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all chats</span>
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
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-2 ring-indigo-500/20"
                    />
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[88%] space-y-2.5 ${isAssistant ? 'text-left' : 'text-right'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block ${
                        isAssistant
                          ? 'bg-slate-50 text-slate-800 border border-slate-100 whitespace-pre-line'
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
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Why this recommendation?
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
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
                <span>AI Agent is formulating recommendations...</span>
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
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI & LLMs</h4>
                <p className="text-[10px] text-slate-500">Learn core AI concepts, LLMs, and RAG</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '33%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1">2 / 6 completed (33%)</span>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next up:</span>
              <ol className="text-xs space-y-1 text-slate-600">
                <li className="font-semibold text-indigo-600">1. Vector Databases (Current)</li>
                <li>2. Build a RAG application</li>
                <li>3. Prompt engineering</li>
                <li>4. Agent frameworks (LangChain)</li>
                <li>5. Deploy an AI app</li>
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
