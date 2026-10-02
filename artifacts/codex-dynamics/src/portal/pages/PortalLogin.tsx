import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, Lock, CheckCircle2, AlertCircle, Building2, User } from 'lucide-react';
import { portalLogin } from '../../services/portalAuth';
import { ThemeToggle } from '../../components/ThemeToggle';

interface PortalLoginProps {
  onLoginSuccess: () => void;
}

export function PortalLogin({ onLoginSuccess }: PortalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await portalLogin(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      await portalLogin(demoEmail, demoPass);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-center items-center p-6 font-sans relative selection:bg-[#0071E3] selection:text-white transition-colors duration-200">
      {/* Top Bar with Theme Toggle and Link to Site */}
      <div className="absolute top-6 inset-x-6 flex items-center justify-between max-w-5xl mx-auto">
        <a
          href="/"
          className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>&larr;</span>
          <span>Codex Dynamics</span>
        </a>
        <ThemeToggle variant="icon" />
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#0A84FF] text-white font-bold text-xl shadow-lg shadow-[#0071e3]/20 mb-3.5 ring-1 ring-white/20">
          CD
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
          Codex Dynamics
        </h1>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1 font-medium">Client Workspace &amp; Portal</p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-7 sm:p-9 shadow-[0_12px_36px_rgba(0,0,0,0.06)] relative">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#0A84FF] text-[11px] font-semibold mb-3 border border-[#0071E3]/20">
            <Lock size={12} />
            <span>Secure Client Sign-In</span>
          </div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-[#86868B] mt-1">Access your websites, milestone deliverables, invoices, and support</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-white mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-white">Password</label>
              <span className="text-[11px] text-[#86868B] font-mono">client123</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your portal password"
              className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer mt-2"
          >
            {loading ? (
              <span className="inline-block size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to Client Portal</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="mt-7 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider text-center mb-3">
            Quick One-Click Demo Profiles
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('eleanor.vance@vancetech.io', 'client123')}
              className="w-full p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-[#0071E3]/15 text-[#0071E3] flex items-center justify-center font-bold text-xs">
                  V
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3] transition-colors">
                    Vance Technology Group
                  </div>
                  <div className="text-[10px] text-[#86868B]">Eleanor Vance (Active Websites &amp; Milestones)</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity">
                Select &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('marcus.brody@brodyandco.com', 'client123')}
              className="w-full p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3] transition-colors">
                    Brody &amp; Co. Architecture
                  </div>
                  <div className="text-[10px] text-[#86868B]">Marcus Brody (High-Performance Web App)</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity">
                Select &rarr;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
