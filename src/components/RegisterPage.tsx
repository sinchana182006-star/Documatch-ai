/**
 * DocuMatch AI - Dedicated Split-Screen Registration Page
 * Left: Visual clarity graphic, editorial copy.
 * Right: Full name, email, passwords with show/hide, validation, authentication.
 */

import React, { useState } from 'react';
import {
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authVisual from '../assets/images/auth_visual_clarity_1791721805501.jpg';

interface Props {
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export const RegisterPage: React.FC<Props> = ({ onNavigate }) => {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Please accept the terms of service and privacy policy to continue.');
      return;
    }

    setLoading(true);
    const { error, success } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (success) {
      setSuccessMessage(
        'Account created successfully! Redirecting to your workspace...'
      );
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1200);
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
          <span className="text-slate-400 hidden sm:inline">Already registered?</span>
          <button
            onClick={() => onNavigate('login')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center">
        <div className="w-full grid lg:grid-cols-12 rounded-3xl border border-slate-800 bg-[#091122]/70 overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Left Panel: High visual clarity & branding */}
          <div className="lg:col-span-5 p-8 lg:p-12 bg-gradient-to-br from-[#0c162e] via-[#091224] to-[#060c18] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded-full px-3 py-1">
                <Sparkles className="w-3 h-3" />
                <span>DocuMatch Workspace</span>
              </div>

              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Turn Document Chaos into Clarity.
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your documents to an autonomous deduplication engine. Uncover identical agreements, track
                negotiation revisions, and visualize your entire legal corpus in seconds.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">SHA-256 Exact Matches</span>
                    <p className="text-slate-400 text-[11px]">Instant bitwise identity detection across formats.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1 rounded-md bg-violet-500/10 text-violet-400 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Tenant-Isolated Storage</span>
                    <p className="text-slate-400 text-[11px]">Encrypted private cloud storage with Row-Level Security.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual graphic */}
            <div className="mt-8 relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-xl">
              <img
                src={authVisual}
                alt="DocuMatch Clarity Visual"
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c162e] via-transparent to-transparent opacity-60" />
            </div>

            <div className="pt-6 text-[11px] text-slate-500">
              <span>Secure Authentication & Enterprise Storage</span>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="lg:col-span-7 p-8 lg:p-12 bg-[#080e1d] flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Create Account</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Start analyzing and detecting duplicate documents today.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Password <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
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

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm Password <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-400 leading-snug cursor-pointer select-none">
                    I agree to the Terms of Service and acknowledge that documents are processed securely with
                    cryptographic hashing and private storage.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    'Registering Account...'
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already have an account? </span>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
