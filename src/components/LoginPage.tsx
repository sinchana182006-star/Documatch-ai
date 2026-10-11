/**
 * DocuMatch AI - Login Page
 * Email & password authentication, remember-session,
 * forgot-password modal, and clean user experience.
 */

import React, { useState } from 'react';
import {
  FileText,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export const LoginPage: React.FC<Props> = ({ onNavigate }) => {
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onNavigate('dashboard');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    setResetResult(null);

    const { error, success } = await resetPassword(resetEmail);
    setResetLoading(false);

    if (error) {
      setResetResult({ success: false, message: error.message });
    } else {
      setResetResult({
        success: true,
        message: 'Password reset link sent! Check your inbox for recovery instructions.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col justify-center">
      {/* Top minimal header */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-base font-bold text-white group cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-sm shadow-cyan-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <span>DocuMatch AI</span>
        </button>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 hidden sm:inline">Don't have an account?</span>
          <button
            onClick={() => onNavigate('register')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-800 bg-[#091122]/80 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to your DocuMatch workspace</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Need an account? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1324] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your account email to receive a password reset link.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />

              {resetResult && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    resetResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}
                >
                  {resetResult.message}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
