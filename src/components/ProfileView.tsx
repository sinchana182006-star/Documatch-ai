/**
 * DocuMatch AI - Profile & Settings View
 * Authenticated user account information, profile editing, password reset,
 * and repository metrics.
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Key,
  CheckCircle,
  AlertCircle,
  LogOut,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoredDocument } from '../lib/documentService';

interface Props {
  documents: StoredDocument[];
  onLogout: () => void;
}

export const ProfileView: React.FC<Props> = ({
  documents,
  onLogout,
}) => {
  const { user, profile, updateProfileName, resetPassword } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || user?.user_metadata?.full_name || '');
  const [savingName, setSavingName] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setStatusMsg(null);

    const { error } = await updateProfileName(fullName);
    setSavingName(false);

    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'success', text: 'Profile name updated successfully!' });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResettingPassword(true);
    setStatusMsg(null);

    const { error, success } = await resetPassword(user.email);
    setResettingPassword(false);

    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else if (success) {
      setStatusMsg({
        type: 'success',
        text: `Password recovery instructions sent to ${user.email}.`,
      });
    }
  };

  // Metrics
  const exactDuplicatesCount = documents.filter(d => d.classification === 'exact_duplicate').length;
  const nearDuplicatesCount = documents.filter(d => d.classification === 'near_duplicate').length;
  const uniqueCount = documents.filter(d => d.classification === 'unique').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Profile & Account Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your account identity, security preferences, and review your document repository metrics.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/50 border-red-500/40 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-950/50">
              {(profile?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {profile?.fullName || user?.user_metadata?.full_name || 'Authenticated User'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email || 'user@documatch.ai'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-xs cursor-not-allowed font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={savingName}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingName ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Statistics Card */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
        <h3 className="text-sm font-semibold text-white">Repository & Storage Metrics</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-slate-400">Total Documents</div>
            <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
              {documents.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-red-400 font-medium">Exact Duplicates</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1 tabular-nums">
              {exactDuplicatesCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-amber-400 font-medium">Near Duplicates</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
              {nearDuplicatesCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-emerald-400 font-medium">Unique Files</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {uniqueCount}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Reset Card */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Account Security</h3>
            <p className="text-xs text-slate-400">
              Manage your credentials and password recovery settings.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Key className="w-4 h-4 text-slate-400" />
            <span>Request password reset email</span>
          </div>

          <button
            type="button"
            disabled={resettingPassword}
            onClick={handlePasswordReset}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {resettingPassword ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
