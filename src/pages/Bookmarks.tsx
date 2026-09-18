import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, Trash2, BookOpen, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Resource } from '../types';

export const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);

  useEffect(() => {
    api.getResources().then(res => setBookmarks(res.filter(r => r.saved)));
  }, []);

  const handleRemove = (id: string) => {
    api.toggleSaveResource(id).then(() => {
      setBookmarks(prev => prev.filter(r => r.id !== id));
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <Bookmark className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your saved video lectures, articles, documentation, and repositories.
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No bookmarks saved yet</h3>
          <p className="text-xs text-slate-400">Save resources from the Learning Resources tab to access them quickly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img src={res.thumbnailUrl} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {res.platform}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{res.title}</h4>
                  <p className="text-[11px] text-slate-400">{res.creator} • {res.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRemove(res.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
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
