import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Search, 
  CheckCircle2, 
  Minus, 
  Check, 
  Sparkles, 
  Play, 
  ExternalLink, 
  Lightbulb, 
  UserCheck, 
  UserPlus, 
  GraduationCap,
  SlidersHorizontal,
  LayoutGrid,
  ListFilter,
  Star
} from 'lucide-react';
import { YoutubeIcon } from '../components/ui/BrandIcons';
import { api } from '../services/api';
import { Creator } from '../types';
import { mockCreators } from '../mocks/data';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/ui/SpotlightCard';

export const Creators: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyRoadmapRelevant, setOnlyRoadmapRelevant] = useState<boolean>(true);

  const categories = [
    'All',
    'AI/ML',
    'Web Dev',
    'DevOps',
    'Career',
    'DSA',
    'Productivity',
    'Design',
    'More'
  ];

  const topicsList = [
    'Programming Basics',
    'DSA',
    'Web Development',
    'Backend & APIs',
    'DevOps / Cloud',
    'AI / LLMs',
    'Projects',
    'Career Guidance'
  ];

  useEffect(() => {
    api.getCreators().then(setCreators);
  }, []);

  const handleToggleFollow = (creatorId: string) => {
    api.toggleFollowCreator(creatorId).then(res => {
      setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, isFollowing: res.isFollowing } : c));
      if (res.isFollowing) {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    });
  };

  const filteredCreators = creators.filter(c => {
    if (selectedCategory !== 'All' && !c.categories.includes(selectedCategory) && !c.tags.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/70 to-blue-50/80 border border-indigo-100/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Rocket className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Creators
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-purple-700">
              Learn from people you trust
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover the best educators, builders, and creators. Get personalized recommendations based on your goals and roadmap.
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-handwriting text-base font-bold text-indigo-700">Real creators.</p>
              <p className="font-handwriting text-base font-bold text-purple-700">Real learning. Real progress.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-700 max-w-[200px] leading-snug">
                &ldquo;Good creators give you knowledge. Great creators give you direction.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Pills & Search Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none">
              <option>Relevance</option>
              <option>Followers</option>
              <option>Roadmap Match</option>
            </select>
          </div>
        </div>

        {/* Search Input Bar with Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, topics, or skills... (e.g. Karpathy, FastAPI, DevOps)"
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
              <span>Show creators relevant to my roadmap</span>
              <button
                type="button"
                onClick={() => setOnlyRoadmapRelevant(!onlyRoadmapRelevant)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  onlyRoadmapRelevant ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    onlyRoadmapRelevant ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Featured Creators Grid (4 Columns matching screenshot 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              Featured Creators
            </h2>
            <p className="text-[11px] text-slate-500">Popular and highly recommended by students</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline">
            View All →
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredCreators.map((creator) => (
            <SpotlightCard
              key={creator.id}
              className="p-5 flex flex-col justify-between space-y-4 bg-white border-slate-200/90"
              spotlightColor="rgba(99, 102, 241, 0.08)"
            >
              {/* Creator Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {creator.name}
                        </h3>
                        {creator.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{creator.handle}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <YoutubeIcon className="w-3 h-3 text-red-500" />
                        <span>{creator.followers}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(creator.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      creator.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    {creator.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {creator.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {creator.bio}
                </p>

                {/* Featured Series */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                    Featured Series
                  </span>
                  <ul className="text-xs space-y-1 text-slate-700">
                    {creator.featuredSeries.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why Relevant to you box */}
              <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-purple-600" />
                  Why relevant to you?
                </span>
                <p className="text-[11px] text-purple-900 leading-snug">
                  {creator.whyRelevant}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* 4. Bottom Section: Creators for Your Path Comparison Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Creators for Your Path
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on your goal: <strong className="text-indigo-600">AI Engineer</strong>
            </p>
          </div>

          <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline">
            View Detailed Comparison →
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Goal Stepper (3 cols) */}
          <div className="lg:col-span-3 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Goal</span>
              <h3 className="text-sm font-extrabold text-slate-900">AI Engineer</h3>
            </div>

            <div className="relative pl-6 space-y-3.5 text-xs font-medium">
              <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-200" />

              {[
                { name: 'Foundations', active: false },
                { name: 'Backend & APIs', active: false },
                { name: 'AI & LLMs', active: true },
                { name: 'Build Projects', active: false },
                { name: 'Deploy & DevOps', active: false },
                { name: 'Career & Jobs', active: false },
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full absolute -left-6 ring-4 ring-slate-50 ${
                    step.active ? 'bg-indigo-600 ring-indigo-100' : 'bg-slate-300'
                  }`} />
                  <span className={step.active ? 'text-indigo-700 font-bold' : 'text-slate-600'}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center Matrix Table (6 cols) */}
          <div className="lg:col-span-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-2 font-bold text-slate-700">Topic</th>
                  {mockCreators.map((c) => (
                    <th key={c.id} className="py-2.5 px-2 text-center">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover mx-auto ring-1 ring-slate-200"
                        title={c.name}
                      />
                      <span className="text-[10px] font-semibold text-slate-600 block mt-1 truncate max-w-[65px] mx-auto">
                        {c.name.split(' ')[0]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topicsList.map((topic) => (
                  <tr key={topic} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-2 font-medium text-slate-800">{topic}</td>
                    {mockCreators.map((c) => {
                      const coverage = c.roadmapCoverage[topic];
                      return (
                        <td key={c.id} className="py-2.5 px-2 text-center">
                          {coverage === 'well' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto fill-emerald-100" />
                          ) : coverage === 'partial' ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-slate-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Legend & Tip (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Roadmap Coverage</span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                  <span>Covers well</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Covers partially</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Minus className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>Not covered</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Tip
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Follow a combination of creators to get a balanced and practical learning experience.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-handwriting text-lg text-indigo-700 font-bold -rotate-1">
                Different creators.
              </p>
              <p className="font-handwriting text-xl text-purple-700 font-extrabold -rotate-2">
                A better you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
