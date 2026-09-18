import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Target, 
  Code2, 
  Layers, 
  Heart, 
  Users2, 
  Brain, 
  Clock, 
  Check, 
  ExternalLink,
  GraduationCap,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { api } from '../services/api';
import { Resource, Profile } from '../types';
import { mockResources, mockProfile } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isListView, setIsListView] = useState<boolean>(false);

  const categories = [
    'All',
    'AI / ML',
    'Backend',
    'DevOps',
    'DSA',
    'Frontend',
    'Career',
    'Tools',
    'System Design'
  ];

  useEffect(() => {
    api.getResources(selectedCategory).then(setResources);
    api.getProfile().then(setProfile);
  }, [selectedCategory]);

  const handleToggleSave = (id: string) => {
    api.toggleSaveResource(id).then(newState => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, saved: newState } : r));
      if (newState) {
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
      }
    });
  };

  const filteredResources = resources.filter(res => {
    if (selectedType !== 'All Types' && !res.platform.includes(selectedType.replace(' Videos', ''))) {
      return false;
    }
    if (selectedLevel !== 'All Levels' && res.difficulty !== selectedLevel) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.creator.toLowerCase().includes(q) ||
        res.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 border border-indigo-100/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Learning Resources
            </h1>
            <p className="text-sm sm:text-base font-semibold text-indigo-700 mt-1">
              Curated content. Personalized for your journey.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-quality resources from the best creators, courses, and communities — filtered for you.
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-handwriting text-base font-bold text-indigo-700">
                  &ldquo;Learn from the best.&rdquo;
                </p>
                <p className="font-handwriting text-base font-bold text-purple-700">
                  &ldquo;Build your future.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Filter Bar & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none cursor-pointer"
          >
            <option value="All Types">All Types</option>
            <option value="YouTube">YouTube Videos</option>
            <option value="Course">Courses</option>
            <option value="Article">Articles</option>
            <option value="GitHub">GitHub Repos</option>
          </select>

          {/* Level dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none cursor-pointer"
          >
            <option value="All Levels">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Search input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {filteredResources.length} curated resources
          </span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1 rounded-md text-xs transition ${!isListView ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1 rounded-md text-xs transition ${isListView ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
              title="List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Section: 2 Columns (Content Left 8 cols, Sidebar Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Resources Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Recommended for you
              </h2>
              <p className="text-[11px] text-slate-500">
                Handpicked based on your goal, current skills, and roadmap progress.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline">
              View More →
            </span>
          </div>

          {/* Cards Container */}
          <div className={isListView ? 'space-y-3' : 'grid grid-cols-1 gap-3.5'}>
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <img
                    src={res.thumbnailUrl}
                    alt=""
                    className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-102 transition"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {res.platform}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {res.creator}
                      </span>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate block"
                    >
                      {res.title}
                    </a>

                    {/* Topic Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {res.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        • {res.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        • <Clock className="w-3 h-3" /> {res.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Save / Open Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleSave(res.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      res.saved
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${res.saved ? 'fill-purple-600 text-purple-600' : ''}`} />
                    <span>{res.saved ? 'Saved' : 'Save'}</span>
                  </button>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Why these resources & Quick Filters */}
        <div className="lg:col-span-4 space-y-4">
          {/* Why these resources? Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Why these resources?</h3>
            </div>
            <p className="text-[11px] text-slate-500">
              These recommendations are personalized for you.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Your Goal</p>
                    <p className="font-bold text-slate-800">Become an {profile.goal}</p>
                  </div>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">Edit</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Your Current Skills</p>
                    <p className="font-bold text-slate-800">Python, JavaScript, Docker, Git</p>
                  </div>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">Edit</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Your Roadmap Progress</p>
                    <p className="font-bold text-slate-800">Backend & APIs (In Progress)</p>
                  </div>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">View</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-[10px] text-slate-400">Your Interests</p>
                    <p className="font-bold text-slate-800">AI, DevOps, Open Source</p>
                  </div>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">Edit</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Top Creator Signals</p>
                    <p className="font-bold text-slate-800">Based on the creators you follow</p>
                  </div>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">View</span>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                We analyze your goal, skills, progress, interests, and the best content from multiple sources to recommend the most relevant resources for you.
              </p>
            </div>
          </div>

          {/* Quick Filters Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Quick Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Free Resources', icon: '🎁' },
                { label: 'Short (< 30 mins)', icon: '⚡' },
                { label: 'Project Based', icon: '💻' },
                { label: 'Beginner Friendly', icon: '🌱' },
                { label: 'Most Popular', icon: '🔥' },
                { label: 'Recently Added', icon: '🕒' },
              ].map((qf) => (
                <button
                  key={qf.label}
                  onClick={() => setSearchQuery(qf.label.split(' ')[0])}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100 text-xs font-medium text-left transition"
                >
                  <span className="mr-1">{qf.icon}</span> {qf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
