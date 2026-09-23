import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Server, Key, User, Shield, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

export const Settings: React.FC = () => {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getProfile().then(p => {
      if (p) {
        setName(p.name || '');
        setGoal(p.goal || '');
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveProfile({ name, goal });
    setSavedSuccess(true);
    success('Configuration Saved', 'Your student profile and API parameters have been updated.');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <PageHeader
        badge="System & Profile"
        title="Settings & Integrations"
        description="Configure your student profile, career aspiration milestones, telemetry preferences, and FastAPI server endpoints."
        icon={SettingsIcon}
        gradient="from-slate-700 to-indigo-800"
        metrics={[
          { label: 'Environment', value: 'Production Ready', color: 'text-indigo-400' },
          { label: 'API Connection', value: 'Active', color: 'text-emerald-400' }
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Profile</h3>
              <p className="text-[11px] text-slate-400">Personalize how Student OS addresses you across AI mentors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Primary Career Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Senior AI Research Engineer"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>
        </div>

        {/* Backend & API Server Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend Server (FastAPI)</h3>
              <p className="text-[11px] text-slate-400">Configure your local or cloud Python AI server endpoint.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono transition"
            />
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
              <Activity className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Default: <code className="text-indigo-600 font-semibold font-mono">http://localhost:8000</code>. If your FastAPI backend is running, requests seamlessly route to live AI models. When offline, high-fidelity mock data is automatically served.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="btn-tactile flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-900/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-scale-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
