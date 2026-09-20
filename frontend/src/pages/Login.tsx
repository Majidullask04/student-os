import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail,
  AlertCircle
} from 'lucide-react';
import { GithubIcon, GoogleIcon } from '../components/ui/BrandIcons';
import { StudentOsLogo } from '../components/ui/StudentOsLogo';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('majidulla@studentos.dev');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Majidulla');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        if (error) throw error;

        await api.signup({ email, password, name });
        localStorage.removeItem('student_os_demo_guest');

        if (data.session) {
          navigate('/onboarding');
        } else {
          setSuccessMsg('Account created! If email confirmation is enabled, please verify your inbox before signing in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        localStorage.removeItem('student_os_demo_guest');
        await api.login({ email, password });
        navigate('/');
      }
    } catch (err: any) {
      console.warn("Supabase Auth notice:", err);
      if (err.message && (err.message.includes('Invalid login') || err.message.includes('User already registered') || err.message.includes('Password should be') || err.message.includes('Email not confirmed'))) {
        setErrorMsg(err.message);
      } else {
        // Offline demo mode fallback
        localStorage.setItem('student_os_demo_guest', 'true');
        await api.login({ email, password });
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.warn("OAuth redirect note:", err);
      localStorage.setItem('student_os_demo_guest', 'true');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem('student_os_demo_guest', 'true');
    navigate('/');
  };

  const features = [
    'Personalized AI learning roadmap tailored to your dream career',
    'Curated high-signal resources from top industry creators',
    'AI Assistant with real-time feedback and gap analysis',
    'Track your consistency, daily study hours, and skill growth',
    'Verified portfolio projects and real job match scores',
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Dark Navy Panel */}
      <div className="lg:col-span-6 bg-[#0B1120] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10">
          <StudentOsLogo size={42} showText={true} theme="dark" />
        </div>

        {/* Center Value Pitch */}
        <div className="relative z-10 my-auto py-12 space-y-8 max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Learning Operating System
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              One platform to guide your entire engineering journey.
            </h1>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Student OS bridges the gap between passive tutorial watching and industry job readiness using adaptive roadmaps and creator curation.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-300 leading-normal">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>&copy; 2026 Student OS Platform</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">System Status</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back to Student OS'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Create one now'}
              </button>
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Majidulla"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full text-xs pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {!isSignUp && (
                  <span className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Student Account' : 'Sign in to Student OS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bypass */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              1-Click Demo Access (Explore as Majidulla)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
