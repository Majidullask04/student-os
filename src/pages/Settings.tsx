import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Server, Key, User, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { mockProfile } from '../mocks/data';
import confetti from 'canvas-confetti';

export const Settings: React.FC = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [name, setName] = useState(mockProfile.name);
  const [goal, setGoal] = useState(mockProfile.goal);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p);
      setName(p.name);
      setGoal(p.goal);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveProfile({ name, goal });
    setSavedSuccess(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <SettingsIcon className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Integrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your personal profile, career targets, and backend API connection.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Student Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Primary Career Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Backend & API Server Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Backend Server (FastAPI)</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Default: <code className="text-indigo-600">http://localhost:8000</code>. When your FastAPI backend is running, requests seamlessly route to it. When offline, mock data is automatically served.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
