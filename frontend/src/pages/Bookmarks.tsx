import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, Trash2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Resource } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

export const Bookmarks: React.FC = () => {
  const { info } = useToast();
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);

  useEffect(() => {
    api.getResources().then(res => setBookmarks(res.filter(r => r.saved)));
  }, []);

  const handleRemove = (id: string, title: string) => {
    api.toggleSaveResource(id).then(() => {
      setBookmarks(prev => prev.filter(r => r.id !== id));
      info('Bookmark Removed', `"${title}" has been removed from your saved library.`);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="Personal Library"
        title="Saved Bookmarks & References"
        description="Quick access to curated research papers, open-source repositories, lectures, and guides you have saved for later."
        icon={Bookmark}
        gradient="from-indigo-600 to-rose-600"
        metrics={[
          { label: 'Saved Items', value: bookmarks.length, color: 'text-rose-400' },
          { label: 'Status', value: 'Synced Offline', color: 'text-emerald-400' }
        ]}
      />

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4 shadow-sm max-w-lg mx-auto mt-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No bookmarks saved yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Explore curated learning resources, articles, and repos, then click the bookmark button to build your personal library.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((res) => (
            <div 
              key={res.id} 
              className="card-hover bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img 
                  src={res.thumbnailUrl} 
                  alt="" 
                  className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono border border-indigo-100">
                    {res.platform}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {res.creator} • {res.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRemove(res.id, res.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                  title="Open resource"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
