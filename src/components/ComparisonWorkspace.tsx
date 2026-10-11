/**
 * DocuMatch AI - Side-by-Side Comparison Workspace
 * Professional side-by-side text diffing, token alignment,
 * similarity score breakdown, and metadata inspection.
 */

import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  FileText,
  Layers,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';
import { StoredDocument } from '../lib/documentService';
import {
  computeTfidfCosineSimilarity,
  computeWordDiff,
  DiffChunk,
} from '../lib/similarityEngine';

interface Props {
  documents: StoredDocument[];
  initialDocAId?: string | null;
  initialDocBId?: string | null;
}

export const ComparisonWorkspace: React.FC<Props> = ({
  documents,
  initialDocAId,
  initialDocBId,
}) => {
  const [docAId, setDocAId] = useState<string>(
    initialDocAId || (documents[0]?.id ?? '')
  );
  const [docBId, setDocBId] = useState<string>(
    initialDocBId || (documents[1]?.id ?? documents[0]?.id ?? '')
  );
  const [copiedText, setCopiedText] = useState<'a' | 'b' | null>(null);

  const docA = useMemo(() => documents.find(d => d.id === docAId), [documents, docAId]);
  const docB = useMemo(() => documents.find(d => d.id === docBId), [documents, docBId]);

  // Swap documents
  const handleSwap = () => {
    const temp = docAId;
    setDocAId(docBId);
    setDocBId(temp);
  };

  // Compute similarity
  const comparison = useMemo(() => {
    if (!docA || !docB) return null;

    const isExact = docA.content_hash === docB.content_hash;
    const sim = computeTfidfCosineSimilarity(
      { text: docA.extracted_text, hash: docA.content_hash },
      { text: docB.extracted_text, hash: docB.content_hash }
    );

    const diff = computeWordDiff(docA.extracted_text, docB.extracted_text);

    return {
      isExact,
      score: isExact ? 1.0 : sim.score,
      commonTerms: sim.commonTerms,
      sharedPhrases: sim.sharedPhrases,
      diff,
    };
  }, [docA, docB]);

  const copyToClipboard = (text: string, which: 'a' | 'b') => {
    navigator.clipboard.writeText(text);
    setCopiedText(which);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (documents.length < 2) {
    return (
      <div className="p-12 text-center rounded-3xl border border-slate-800 bg-[#080e1d] max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Need at Least 2 Documents</h3>
        <p className="text-xs text-slate-400">
          Upload at least two documents to perform side-by-side linguistic comparison and diff highlighting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Selector Strip */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080e1d] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Side-by-Side Comparison Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Word-level diff engine comparing extracted text, cryptographic hashes, and vocabulary overlap.
            </p>
          </div>

          {comparison && (
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${
                  comparison.isExact
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : comparison.score >= 0.70
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                }`}
              >
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Similarity Score</div>
                  <div className="text-xl font-bold font-mono tabular-nums leading-tight">
                    {Math.round(comparison.score * 100)}%
                  </div>
                </div>
                <div className="text-xs font-semibold">
                  {comparison.isExact
                    ? '100% Exact Duplicate'
                    : comparison.score >= 0.70
                    ? 'Near Duplicate'
                    : 'Low Overlap'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Selection Pickers */}
        <div className="grid md:grid-cols-12 gap-4 items-center">
          {/* Document A Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>Primary Document (Left)</span>
            </label>
            <select
              value={docAId}
              onChange={e => setDocAId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {documents.map(d => (
                <option key={`a-${d.id}`} value={d.id}>
                  {d.name} ({d.file_type.toUpperCase()} · {d.word_count} words)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-4 md:pt-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors shadow-sm"
              title="Swap primary and target document"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Document B Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
              <span>Comparison Document (Right)</span>
            </label>
            <select
              value={docBId}
              onChange={e => setDocBId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              {documents.map(d => (
                <option key={`b-${d.id}`} value={d.id}>
                  {d.name} ({d.file_type.toUpperCase()} · {d.word_count} words)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Common Terms & Metadata Summary */}
        {comparison && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Shared Key Terms:</span>
              <div className="flex flex-wrap gap-1.5">
                {comparison.commonTerms.length > 0 ? (
                  comparison.commonTerms.map(term => (
                    <span
                      key={term}
                      className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-mono"
                    >
                      {term}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No notable shared keywords</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-red-400/30 border border-red-500/50" /> Removed in B
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-400/30 border border-emerald-500/50" /> Added in B
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-slate-800" /> Identical
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Viewport */}
      {docA && docB && comparison && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Document A */}
          <div className="rounded-3xl border border-cyan-500/30 bg-[#080e1d] overflow-hidden flex flex-col shadow-xl">
            {/* Document A Header */}
            <div className="p-4 bg-[#0a1224] border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs truncate flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{docA.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{docA.word_count} words</span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">SHA: {docA.content_hash.slice(0, 16)}...</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(docA.extracted_text, 'a')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy extracted text"
              >
                {copiedText === 'a' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Document A Diff Body */}
            <div className="p-6 overflow-y-auto max-h-[550px] font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-cyan-500/30">
              {comparison.diff.leftChunks.map((chunk, idx) => {
                if (chunk.type === 'removed') {
                  return (
                    <span
                      key={`left-del-${idx}`}
                      className="bg-red-950/60 text-red-300 line-through rounded px-0.5"
                    >
                      {chunk.value}
                    </span>
                  );
                }
                return <span key={`left-same-${idx}`}>{chunk.value}</span>;
              })}
            </div>
          </div>

          {/* Right Column: Document B */}
          <div className="rounded-3xl border border-violet-500/30 bg-[#080e1d] overflow-hidden flex flex-col shadow-xl">
            {/* Document B Header */}
            <div className="p-4 bg-[#0a1224] border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs truncate flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">{docB.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{docB.word_count} words</span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">SHA: {docB.content_hash.slice(0, 16)}...</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(docB.extracted_text, 'b')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy extracted text"
              >
                {copiedText === 'b' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Document B Diff Body */}
            <div className="p-6 overflow-y-auto max-h-[550px] font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-violet-500/30">
              {comparison.diff.rightChunks.map((chunk, idx) => {
                if (chunk.type === 'added') {
                  return (
                    <span
                      key={`right-add-${idx}`}
                      className="bg-emerald-950/60 text-emerald-300 rounded px-0.5"
                    >
                      {chunk.value}
                    </span>
                  );
                }
                return <span key={`right-same-${idx}`}>{chunk.value}</span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
