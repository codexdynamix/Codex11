import React from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";

interface AdminLoginProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  authError: string;
  handleLogin: (e: React.FormEvent) => void;
}

export function AdminLogin({
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  authError,
  handleLogin,
}: AdminLoginProps) {
  const handleReturnToPublic = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("codex_return_to_public", "true");
      sessionStorage.removeItem("codex_on_admin");
      localStorage.removeItem("codex_on_admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-label flex items-center justify-center p-4 relative selection:bg-blue/15">
      {/* Background subtle radial gradient / grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            to="/"
            onClick={handleReturnToPublic}
            className="inline-flex items-center gap-2.5 mb-3 group"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-blue text-paper shadow-[inset_0_0.5px_0_rgb(255_255_255_/_0.35)] transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm font-semibold tracking-tight">C</span>
            </span>
            <span className="text-xl font-display font-semibold tracking-tight text-label">
              Codex Dynamics
            </span>
          </Link>
          <p className="text-xs font-medium tracking-[0.22em] text-subtle uppercase">
            Back Office & CRM Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="surface-lift rounded-3xl bg-card border border-black/8 p-7 sm:p-9 shadow-[0_0_0_1px_rgb(0_0_0_/_0.05),0_4px_16px_rgb(0_0_0_/_0.06)] backdrop-blur-xl">
          <div className="pb-5 mb-6 border-b border-hairline text-center">
            <h1 className="text-lg font-semibold tracking-tight text-label font-display text-center">
              Administrator Sign In
            </h1>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs mb-5 flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-label placeholder:text-subtle transition-all outline-none"
                placeholder="admin@codexdynamics.com"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-label placeholder:text-subtle transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue hover:bg-blue-hover text-paper font-medium py-3 rounded-full text-sm transition-all duration-200 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Login</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-center text-xs text-subtle">
            <Link
              to="/"
              onClick={handleReturnToPublic}
              className="hover:text-label transition-colors inline-flex items-center gap-1 font-medium"
            >
              Public Website <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
