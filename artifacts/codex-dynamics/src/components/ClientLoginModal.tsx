import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  KeyRound,
  ExternalLink,
  Sparkles,
  UserPlus,
  LogOut,
  User,
} from 'lucide-react';
import {
  portalLogin,
  readPortalSession,
  clearPortalSession,
  setPortalSession,
  type PortalSession,
  type PortalClient,
} from '@/services/portalAuth';
import { portalDb } from '@/services/portalDatabase';

export interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenContact?: () => void;
}

export function ClientLoginModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenContact,
}: ClientLoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSession, setCurrentSession] = useState<PortalSession | null>(null);

  // Register fields for new clients
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regService, setRegService] = useState('High-Performance Website');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Read session whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSession(readPortalSession());
      setError('');
      setRegError('');
    }
  }, [isOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await portalLogin(email.trim(), password.trim());
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.assign('/portal/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please provide your name, email, and password.');
      return;
    }

    setRegLoading(true);
    setRegError('');

    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          company: regCompany.trim() || regName.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          service: regService,
          source: 'portal_client_registration',
          message: `New client account registered for ${regCompany.trim() || regName.trim()}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to create account. Please try again.');
      }

      // Automatically authenticate the newly registered client
      const newClientRecord: PortalClient = data.client || {
        id: data.id || `client_${Date.now()}`,
        name: regName.trim(),
        company: regCompany.trim() || regName.trim(),
        email: regEmail.trim(),
        phone: '',
        address: '',
        country: 'United Kingdom',
        countryCode: 'GB',
        status: 'Active',
        portalEnabled: true,
        tier: 'New Client',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      portalDb.adminCreateClient(newClientRecord);
      setPortalSession(newClientRecord);

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.assign('/portal/dashboard');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Could not register client account.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickSelect = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');

    try {
      await portalLogin(demoEmail, demoPass);
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.assign('/portal/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  const handleSignOutCurrent = () => {
    clearPortalSession();
    setCurrentSession(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-sans"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#0A84FF] text-[11px] font-semibold mb-2.5 border border-[#0071E3]/20">
                <span className="size-1.5 rounded-full bg-[#30D158] animate-pulse" />
                <span>Connected to Codex SQL Database</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
                Client Workspace Login
              </h2>
              <p className="text-xs text-[#86868B] mt-1">
                Access your digital properties, project milestones, invoices, and support
              </p>
            </div>

            {/* If currently signed in, show an active session alert */}
            {currentSession && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-semibold text-[#1D1D1F] dark:text-white">
                      Signed in as {currentSession.client.name}
                    </div>
                    <div className="text-[#86868B] text-[11px]">
                      {currentSession.client.company || currentSession.client.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.assign('/portal/dashboard');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Enter Workspace &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOutCurrent}
                    className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white font-medium text-[11px] transition-colors cursor-pointer"
                    title="Switch Account"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                New Client Registration
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {activeTab === 'login' && (
              <div>
                {error && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium">{error}</div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eleanor.vance@vancetech.io"
                      className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-white">
                        Password
                      </label>
                      <span className="text-[11px] text-[#86868B]">Default demo: client123</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Client Workspace</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Select Demo Accounts */}
                <div className="mt-5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider text-center mb-2">
                    Quick-Select Test Client Profiles
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickSelect('eleanor.vance@vancetech.io', 'client123')}
                      className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-colors cursor-pointer border border-transparent hover:border-[#0071E3]/30"
                    >
                      <div className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                        Eleanor Vance
                      </div>
                      <div className="text-[10px] text-[#86868B] truncate">Vance Tech</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSelect('marcus@brodydesign.co', 'client123')}
                      className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
                    >
                      <div className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                        Marcus Brody
                      </div>
                      <div className="text-[10px] text-[#86868B] truncate">Brody Luxury</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSelect('client@codexdynamics.com', 'client123')}
                      className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-colors cursor-pointer border border-transparent hover:border-purple-500/30"
                    >
                      <div className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                        Alex Morgan
                      </div>
                      <div className="text-[10px] text-[#86868B] truncate">Morgan Media</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NEW CLIENT REGISTRATION */}
            {activeTab === 'register' && (
              <div>
                {regError && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium">{regError}</div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="Apex Technologies"
                        className="w-full px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="sarah@apextech.com"
                        className="w-full px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                        Create Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                      Project Service Needed
                    </label>
                    <select
                      value={regService}
                      onChange={(e) => setRegService(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                    >
                      <option value="High-Performance Website">High-Performance Website</option>
                      <option value="Web Application & SaaS">Web Application &amp; SaaS</option>
                      <option value="E-Commerce & Digital Commerce">E-Commerce &amp; Digital Commerce</option>
                      <option value="Custom Software & System Re-architecture">Custom Software &amp; System Re-architecture</option>
                      <option value="Cloud Infrastructure & Hosting">Cloud Infrastructure &amp; Hosting</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {regLoading ? (
                      <span className="inline-block size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Create Account &amp; Open Workspace</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-[#86868B] text-center mt-1">
                    Your account is instantly provisioned in the SQLite database and linked with a new CRM lead profile.
                  </p>
                </form>
              </div>
            )}

            {/* Footer with Staff link */}
            <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-[11px] text-[#86868B]">
              {onOpenContact && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenContact();
                  }}
                  className="text-[#0071E3] hover:underline font-medium cursor-pointer"
                >
                  General inquiries &rarr;
                </button>
              )}
              <a
                href="/admin"
                className="hover:text-[#0071E3] dark:hover:text-[#0A84FF] transition-colors flex items-center gap-1 font-medium ml-auto"
              >
                <span>Staff &amp; CRM Admin Portal</span>
                <span>&rarr;</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
