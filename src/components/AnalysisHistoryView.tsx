/**
 * DocuMatch AI - Analysis History View
 * Searchable timeline of historical analysis jobs, duplicate findings, and reports.
 */

import React, { useState } from 'react';
import {
  History,
  Layers,
  Search,
  Calendar,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  GitCompare,
} from 'lucide-react';
import { StoredHistoryItem, StoredAnalysisJob } from '../lib/documentService';

interface Props {
  history: StoredHistoryItem[];
  jobs: StoredAnalysisJob[];
  onNavigateToAnalysis: () => void;
  onRefresh: () => void;
}

export const AnalysisHistoryView: React.FC<Props> = ({
  history,
  jobs,
  onNavigateToAnalysis,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(h =>
    h.description.toLowerCase().includes(search.toLowerCase()) ||
    h.action_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analysis History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical audit logs of batch document analyses, similarity calculations, and duplicate detections.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#080f20]/60 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search history records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredHistory.length} audit records
        </span>
      </div>

      {/* History Timeline */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-[#080e1d] text-xs text-slate-400 space-y-3">
          <History className="w-8 h-8 mx-auto text-slate-600" />
          <p>No analysis history recorded yet.</p>
          <p className="text-[11px] text-slate-500">
            Upload documents and run batch similarity analysis to record audit events.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(item => {
            const dateStr = new Date(item.created_at).toLocaleString();

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-800 bg-[#080f20]/60 hover:bg-[#080f20] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-white text-sm">{item.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span className="font-mono text-cyan-400 uppercase">{item.action_type}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </span>
                      {item.metadata?.exact !== undefined && (
                        <>
                          <span>·</span>
                          <span className="text-red-400 font-medium">
                            {item.metadata.exact} Exact Duplicates
                          </span>
                          <span>·</span>
                          <span className="text-amber-400 font-medium">
                            {item.metadata.near} Near Duplicates
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onNavigateToAnalysis}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 rounded-xl transition-all"
                  >
                    <span>View Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
