import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        const onboarded = await api.isOnboarded();
        navigate(onboarded ? '/' : '/onboarding');
      }
    } catch (err: any) {
      console.warn("Supabase Auth notice:", err);
      if (err.message && (err.message.includes('Invalid login') || err.message.includes('User already registered') || err.message.includes('Password should be') || err.message.includes('Email not confirmed'))) {
        setErrorMsg(err.message);
      } else {
        // Offline demo mode fallback
        localStorage.setItem('student_os_demo_guest', 'true');
        await api.login({ email, password });
        const onboarded = await api.isOnboarded();
        navigate(onboarded ? '/' : '/onboarding');
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
      const onboarded = await api.isOnboarded();
      navigate(onboarded ? '/' : '/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    localStorage.setItem('student_os_demo_guest', 'true');
    const onboarded = await api.isOnboarded();
    navigate(onboarded ? '/' : '/onboarding');
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
      {/* Left Engineering Showcase Panel */}
      <div className="lg:col-span-6 bg-[#090D16] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-slate-800 bg-dot-grid-dark">
        {/* Brand & System Status */}
        <div className="relative z-10 flex items-center justify-between">
          <StudentOsLogo size={36} showText={true} theme="dark" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kernel v2.4</span>
          </div>
        </div>

        {/* Center Technical Pitch & Interactive Terminal */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono font-semibold text-indigo-400 mb-3">
              <span>AGY://STUDENT-OS/CORE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              The engineering operating system for ambitious builders.
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
              Synthesizes real-time knowledge graphs, multi-stage roadmaps, and 5-dimensional career gap analysis for production readiness.
            </p>
          </div>

          {/* System Terminal Simulator (Engineer Grade) */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-[11px]">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[10px] text-slate-400">runtime-telemetry.log</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">● LIVE</span>
            </div>

            <div className="p-4 space-y-1.5 text-slate-300 leading-relaxed overflow-x-auto">
              <p className="text-slate-500">// Bootstrapping agentic context</p>
              <p><span className="text-indigo-400">[agent:init]</span> runtime initialized on local core (port 8000)</p>
              <p><span className="text-emerald-400">[rag:embed]</span> 768-dim dense embedding vector index synced</p>
              <p><span className="text-purple-400">[tenant:guard]</span> strict user tenant isolation active</p>
              <p><span className="text-amber-400">[eval:engine]</span> 5D career readiness scoring loaded (100% pass)</p>
              <p className="text-slate-400 pt-1 flex items-center gap-1.5">
                <span className="text-indigo-400">➜</span>
                <span className="text-emerald-300 animate-pulse">Awaiting student authentication...</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-5 font-mono">
          <span>&copy; 2026 Student OS Platform</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer">v2.4.0</span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer">Docs</span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer">Security</span>
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
              className="btn-tactile flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="btn-tactile flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1 animate-scale-in">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactile w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-900/20 transition cursor-pointer disabled:opacity-50"
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
              className="btn-tactile w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer"
            >
              ⚡ 1-Click Guest Tour (Explore Live Demo Environment)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
