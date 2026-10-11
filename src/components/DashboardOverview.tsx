/**
 * DocuMatch AI - Dashboard Overview View
 * Real-time statistics from document records, similarity overview distribution,
 * recent document activity, and quick actions.
 */

import React from 'react';
import {
  FileText,
  Layers,
  Search,
  Upload,
  ArrowRight,
  GitCompare,
  Network,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { StoredDocument, StoredHistoryItem, StoredAnalysisJob } from '../lib/documentService';

interface Props {
  documents: StoredDocument[];
  history: StoredHistoryItem[];
  jobs: StoredAnalysisJob[];
  onNavigate: (tab: string) => void;
  onOpenComparison: (docAId: string, docBId: string) => void;
}

export const DashboardOverview: React.FC<Props> = ({
  documents,
  history,
  jobs,
  onNavigate,
  onOpenComparison,
}) => {
  // Real stats from stored documents
  const totalDocs = documents.length;
  const exactDuplicates = documents.filter(d => d.classification === 'exact_duplicate').length;
  const nearDuplicates = documents.filter(d => d.classification === 'near_duplicate').length;
  const uniqueDocs = documents.filter(d => d.classification === 'unique').length;

  const exactPct = totalDocs > 0 ? Math.round((exactDuplicates / totalDocs) * 100) : 0;
  const nearPct = totalDocs > 0 ? Math.round((nearDuplicates / totalDocs) * 100) : 0;
  const uniquePct = totalDocs > 0 ? Math.round((uniqueDocs / totalDocs) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#091224] via-[#0d1a33] to-[#081020] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-cyan-950/20">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded-full px-3 py-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Document Intelligence Active</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Repository Health & Deduplication Overview
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            All similarity metrics are computed from cryptographic SHA-256 fingerprints and high-dimensional TF-IDF
            vectors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl transition-all shadow-md shadow-cyan-500/25 whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Documents</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('similarity')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all whitespace-nowrap cursor-pointer"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Similarity Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Documents</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {totalDocs}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Processed in repository</div>
        </div>

        {/* Exact Duplicates */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-medium">Exact Duplicates</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-2 tabular-nums">
            {exactDuplicates}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">{exactPct}% of repository</div>
        </div>

        {/* Near Duplicates */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Near Duplicates</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <GitCompare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2 tabular-nums">
            {nearDuplicates}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">{nearPct}% of repository</div>
        </div>

        {/* Unique Documents */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">Unique Documents</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
            {uniqueDocs}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">{uniquePct}% of repository</div>
        </div>
      </div>

      {/* Similarity Overview Distribution Bar */}
      {totalDocs > 0 && (
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Repository Similarity Distribution</span>
            <span className="text-slate-400 font-mono">{totalDocs} Documents Ingested</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden flex">
            {exactPct > 0 && (
              <div
                style={{ width: `${exactPct}%` }}
                className="bg-red-500 h-full transition-all duration-500"
                title={`Exact Duplicates: ${exactDuplicates} (${exactPct}%)`}
              />
            )}
            {nearPct > 0 && (
              <div
                style={{ width: `${nearPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Near Duplicates: ${nearDuplicates} (${nearPct}%)`}
              />
            )}
            {uniquePct > 0 && (
              <div
                style={{ width: `${uniquePct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Unique Documents: ${uniqueDocs} (${uniquePct}%)`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Exact Duplicates ({exactDuplicates} · {exactPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Near Duplicates ({nearDuplicates} · {nearPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Unique Files ({uniqueDocs} · {uniquePct}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Recent Documents Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Recent Documents Activity */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Document Ingestions</h3>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              View All Documents →
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <p>No documents uploaded yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map(doc => {
                const isExact = doc.classification === 'exact_duplicate';
                const isNear = doc.classification === 'near_duplicate';

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{doc.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono uppercase">{doc.file_type}</span>
                          <span>·</span>
                          <span className="tabular-nums">{doc.word_count} words</span>
                          <span>·</span>
                          <span
                            className={
                              isExact
                                ? 'text-red-400 font-semibold'
                                : isNear
                                ? 'text-amber-400 font-semibold'
                                : 'text-emerald-400'
                            }
                          >
                            {isExact ? 'Exact Duplicate' : isNear ? 'Near Duplicate' : 'Unique'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {doc.duplicate_of_id && (
                      <button
                        type="button"
                        onClick={() => onOpenComparison(doc.id, doc.duplicate_of_id!)}
                        className="px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        Compare Diff
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Analyses Audit */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Analysis Log</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              Full History →
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <p>No batch analyses logged yet.</p>
              <p className="text-[11px] text-slate-500">
                Run similarity analysis on your queue to record audit benchmarks.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 space-y-1 text-xs"
                >
                  <div className="font-medium text-white">{item.description}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="font-mono text-cyan-400 uppercase">{item.action_type}</span>
                    <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
