import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  Pin, 
  Sparkles, 
  Calendar, 
  Image, 
  Link as LinkIcon, 
  BarChart2, 
  FolderGit2, 
  Check, 
  ExternalLink,
  Search,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { CommunityPost } from '../types';
import { mockCommunityPosts, mockProfile } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [activeTab, setActiveTab] = useState<'Feed' | 'Study Groups' | 'Events' | 'Find Buddies' | 'Creator Communities'>('Feed');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.getCommunityPosts().then(setPosts);
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const created = await api.createPost(newTitle.trim(), newBody.trim(), selectedCategory === 'All' ? 'AI/ML' : selectedCategory);
    setPosts([created, ...posts]);
    setNewTitle('');
    setNewBody('');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
  };

  const handleToggleLike = async (postId: string) => {
    const isLiked = await api.toggleLikePost(postId);
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked,
          likesCount: p.likesCount + (isLiked ? 1 : -1)
        };
      }
      return p;
    }));
  };

  const handleToggleJoin = (groupId: string) => {
    setJoinedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
  };

  const categories = ['All', 'AI/ML', 'DevOps', 'Web Dev', 'Projects', 'DSA', 'Career & Jobs'];

  const filteredPosts = posts.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Connect · Learn · Build Together • Study groups, peer reviews, and creator hangouts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {(['Feed', 'Study Groups', 'Events', 'Find Buddies', 'Creator Communities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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

      {/* 2. Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Post Composer & Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Composer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/student-avatar.jpg"
                alt="User"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <span className="text-xs font-bold text-slate-800">
                Share a learning milestone, project repo, or question...
              </span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-2.5">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title (e.g. Just built my first FastAPI endpoint with PostgreSQL!)"
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 transition"
              />

              <textarea
                rows={3}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Share your breakthrough, what went well, or what you learned..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 transition"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition" title="Add Image">
                    <Image className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition" title="Add Link">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition" title="Add Poll">
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition" title="Attach Project">
                    <FolderGit2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newBody.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-2xl p-5 border shadow-2xs transition duration-150 space-y-3.5 ${
                  post.isPinned ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                {/* Post Author Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{post.authorName}</h4>
                        {post.isPinned && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Pin className="w-2.5 h-2.5 rotate-45" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{post.timeAgo}</span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-600">{post.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Body */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{post.body}</p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags.map((ht) => (
                    <span key={ht} className="text-[11px] font-medium text-indigo-600 hover:underline cursor-pointer">
                      {ht}
                    </span>
                  ))}
                </div>

                {/* Action Counters */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-red-500 transition ${
                      post.isLiked ? 'text-red-500 font-bold' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount} comments</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-indigo-600 transition ml-auto">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Community Stats & Recommendations */}
        <div className="lg:col-span-4 space-y-4">
          {/* Community Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Community Stats</h3>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-lg font-extrabold text-slate-900 block">12,480</span>
                <span className="text-[10px] text-slate-500">Students Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50">
                <span className="text-lg font-extrabold text-purple-700 block">3,420</span>
                <span className="text-[10px] text-purple-700">Discussions</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50">
                <span className="text-lg font-extrabold text-indigo-700 block">240</span>
                <span className="text-[10px] text-indigo-700">Study Groups</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <span className="text-lg font-extrabold text-emerald-700 block">18</span>
                <span className="text-[10px] text-emerald-700">Weekly Events</span>
              </div>
            </div>
          </div>

          {/* AI Community Recommendations */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">Recommended Study Groups</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { id: 'g1', name: 'FastAPI & RAG Builders', members: '482 members', tag: 'Direct Match' },
                { id: 'g2', name: 'Karpathy Neural Networks Club', members: '1.2k members', tag: 'AI Pioneers' },
                { id: 'g3', name: 'Daily LeetCode & DSA 75', members: '890 members', tag: 'Interview Prep' },
              ].map((g) => (
                <div key={g.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800">{g.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{g.members} • {g.tag}</p>
                  </div>
                  <button
                    onClick={() => handleToggleJoin(g.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      joinedGroups[g.id]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {joinedGroups[g.id] ? 'Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Upcoming Live Events</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-600">Tomorrow • 6:00 PM IST</span>
                <h4 className="font-bold text-slate-800">Building Production RAG with LangChain</h4>
                <p className="text-[11px] text-slate-500">Live coding session with open Q&A</p>
                <button className="text-xs font-bold text-indigo-600 hover:underline pt-1 block">
                  Register for Free →
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-600">Saturday • 8:00 PM IST</span>
                <h4 className="font-bold text-slate-800">AI Engineer Resume Review & Roast</h4>
                <p className="text-[11px] text-slate-500">Peer review and live feedback from tech leads</p>
                <button className="text-xs font-bold text-indigo-600 hover:underline pt-1 block">
                  Register for Free →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
