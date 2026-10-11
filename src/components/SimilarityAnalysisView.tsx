/**
 * DocuMatch AI - Similarity Analysis Results & Interactive Similarity Map
 * Displays exact duplicate groups, near-duplicate clusters, dynamic thresholds,
 * and an interactive SVG/Canvas node graph with selectable nodes and comparison links.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Network,
  Layers,
  GitCompare,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  Maximize2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StoredDocument } from '../lib/documentService';
import {
  analyzeDocumentCollection,
  PairwiseSimilarityResult,
  DocumentItem,
  DocumentAnalysisReport,
} from '../lib/similarityEngine';

interface Props {
  documents: StoredDocument[];
  onOpenComparison: (docAId: string, docBId: string) => void;
  onNavigateToUpload: () => void;
}

export const SimilarityAnalysisView: React.FC<Props> = ({
  documents,
  onOpenComparison,
  onNavigateToUpload,
}) => {
  const [threshold, setThreshold] = useState<number>(0.70);
  const [filterType, setFilterType] = useState<'all' | 'exact' | 'near' | 'unique'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [hoveredPair, setHoveredPair] = useState<PairwiseSimilarityResult | null>(null);

  // Compute similarity report based on current documents and threshold
  const report: DocumentAnalysisReport = useMemo(() => {
    if (documents.length < 2) {
      return {
        totalDocuments: documents.length,
        exactDuplicatePairs: [],
        nearDuplicatePairs: [],
        uniqueDocumentsCount: documents.length,
        exactDuplicatesCount: 0,
        nearDuplicatesCount: 0,
        matrix: [],
        documentSummaries: documents.map(d => ({
          id: d.id,
          name: d.name,
          classification: 'unique',
          highestSimilarity: 0,
        })),
      };
    }

    const items: DocumentItem[] = documents.map(d => ({
      id: d.id,
      name: d.name,
      contentHash: d.content_hash,
      normalizedText: d.extracted_text.toLowerCase(),
      rawText: d.extracted_text,
      fileType: d.file_type,
      fileSize: d.file_size,
      wordCount: d.word_count,
    }));

    return analyzeDocumentCollection(items, threshold);
  }, [documents, threshold]);

  // Selected document details
  const selectedDoc = useMemo(
    () => documents.find(d => d.id === selectedDocId),
    [documents, selectedDocId]
  );

  // Filtered pairs
  const filteredPairs = useMemo(() => {
    return report.matrix.filter(pair => {
      // Search
      const matchesSearch =
        pair.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.targetName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'exact') return pair.isExactDuplicate;
      if (filterType === 'near') return pair.isNearDuplicate;
      return true;
    });
  }, [report.matrix, filterType, searchQuery]);

  // Node Positions for the Interactive Similarity Map
  const nodePositions = useMemo(() => {
    const width = 800;
    const height = 460;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 80;

    const count = documents.length;
    const positions: Record<string, { x: number; y: number; name: string; doc: StoredDocument }> = {};

    documents.forEach((doc, idx) => {
      // Calculate angle
      const angle = (idx / (count || 1)) * 2 * Math.PI - Math.PI / 2;
      
      // Pull nodes closer if they share high similarity with doc 0
      const sum = report.documentSummaries.find(s => s.id === doc.id);
      const dist = sum?.classification === 'exact_duplicate'
        ? radius * 0.45
        : sum?.classification === 'near_duplicate'
        ? radius * 0.70
        : radius;

      positions[doc.id] = {
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        name: doc.name,
        doc,
      };
    });

    return { positions, width, height };
  }, [documents, report]);

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-slate-800 bg-[#080e1d] max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
          <Network className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Documents in Library</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Upload at least 2 documents (PDF, DOCX, or TXT) to run real-time cryptographic hashing and
          vectorized similarity mapping.
        </p>
        <button
          onClick={onNavigateToUpload}
          className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
        >
          Go to Upload Documents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Metrics Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Similarity Analysis Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Vectorized pairwise similarity matrix, duplicate classifications, and interactive network map.
          </p>
        </div>

        {/* Dynamic Threshold Slider */}
        <div className="flex items-center gap-3 bg-[#0a1224] border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Near-Duplicate Threshold:</span>
          <span className="font-mono text-cyan-400 font-bold tabular-nums">
            {Math.round(threshold * 100)}%
          </span>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total Analyzed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {report.totalDocuments}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cross-matrix evaluated</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-red-500/20">
          <div className="text-xs text-red-400 font-medium">Exact Duplicates</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1 tabular-nums">
            {report.exactDuplicatesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% SHA-256 fingerprint match</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20">
          <div className="text-xs text-amber-400 font-medium">Near Duplicates</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {report.nearDuplicatesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">≥ {Math.round(threshold * 100)}% TF-IDF Cosine</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
          <div className="text-xs text-emerald-400 font-medium">Unique Documents</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {report.uniqueDocumentsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">&lt; {Math.round(threshold * 100)}% similarity</div>
        </div>
      </div>

      {/* Interactive Similarity Map Section */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080e1d] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Interactive Document Similarity Map</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nodes represent documents. Connecting line thickness reflects similarity strength. Click any node to
              inspect or compare.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Exact (100%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Near (≥{Math.round(threshold * 100)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Unique
            </span>
          </div>
        </div>

        {/* SVG Network Graph Canvas */}
        <div className="relative w-full h-[460px] bg-[#050914] rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
          <svg
            viewBox={`0 0 ${nodePositions.width} ${nodePositions.height}`}
            className="w-full h-full select-none"
          >
            <defs>
              <linearGradient id="edgeGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="edgeGradExact" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Render connecting edges */}
            {report.matrix.map((pair, idx) => {
              const posA = nodePositions.positions[pair.sourceId];
              const posB = nodePositions.positions[pair.targetId];
              if (!posA || !posB) return null;

              // Only draw edges if similarity is above 0.15 or near/exact
              if (pair.similarityScore < 0.20 && !pair.isExactDuplicate) return null;

              const isExact = pair.isExactDuplicate;
              const isNear = pair.isNearDuplicate;
              const strokeWidth = isExact ? 3.5 : Math.max(1, pair.similarityScore * 4);
              const strokeColor = isExact ? 'url(#edgeGradExact)' : isNear ? '#f59e0b' : '#334155';
              const opacity = isExact ? 0.9 : Math.max(0.2, pair.similarityScore);

              return (
                <g key={`edge-${pair.sourceId}-${pair.targetId}`}>
                  <line
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={opacity}
                    strokeDasharray={isNear ? '4,3' : undefined}
                    className="transition-all duration-300 hover:stroke-cyan-300 cursor-pointer"
                    onMouseEnter={() => setHoveredPair(pair)}
                    onMouseLeave={() => setHoveredPair(null)}
                    onClick={() => onOpenComparison(pair.sourceId, pair.targetId)}
                  />
                  {/* Midpoint Label if similarity > 0.40 */}
                  {pair.similarityScore >= 0.40 && (
                    <text
                      x={(posA.x + posB.x) / 2}
                      y={(posA.y + posB.y) / 2 - 4}
                      fill={isExact ? '#ef4444' : isNear ? '#f59e0b' : '#64748b'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono select-none pointer-events-none"
                    >
                      {Math.round(pair.similarityScore * 100)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render document nodes */}
            {Object.entries(nodePositions.positions).map(([id, node]) => {
              const sum = report.documentSummaries.find(s => s.id === id);
              const isSelected = selectedDocId === id;
              const isExact = sum?.classification === 'exact_duplicate';
              const isNear = sum?.classification === 'near_duplicate';

              const nodeColor = isExact ? '#ef4444' : isNear ? '#f59e0b' : '#10b981';

              return (
                <g
                  key={id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedDocId(id)}
                >
                  {/* Subtle outer focus ring */}
                  {isSelected && (
                    <circle r="26" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3,3" />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="18"
                    fill="#0b1324"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Icon text */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="10"
                    fontWeight="bold"
                    fill={nodeColor}
                    className="font-mono pointer-events-none select-none uppercase"
                  >
                    {node.doc.file_type}
                  </text>

                  {/* Document Name label */}
                  <text
                    textAnchor="middle"
                    dy="32"
                    fontSize="10"
                    fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                    className="font-sans font-medium pointer-events-none select-none"
                  >
                    {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Info Pill */}
          {hoveredPair && (
            <div className="absolute top-4 right-4 p-3 rounded-xl bg-[#0b1426]/95 border border-cyan-500/30 text-xs text-white shadow-xl backdrop-blur-md max-w-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-cyan-300">Pairwise Match</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {Math.round(hoveredPair.similarityScore * 100)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {hoveredPair.sourceName} ↔ {hoveredPair.targetName}
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Click edge to launch Side-by-Side Comparison
              </div>
            </div>
          )}
        </div>

        {/* Selected Document Details Card */}
        {selectedDoc && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">{selectedDoc.name}</span>
                <span className="font-mono uppercase text-slate-400">({selectedDoc.file_type})</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-3">
                <span>{selectedDoc.word_count} words</span>
                <span>·</span>
                <span className="font-mono">SHA-256: {selectedDoc.content_hash.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Find strongest match */}
              {(() => {
                const bestPair = report.matrix.find(
                  p =>
                    (p.sourceId === selectedDoc.id || p.targetId === selectedDoc.id) &&
                    p.similarityScore > 0
                );
                if (bestPair) {
                  const otherId =
                    bestPair.sourceId === selectedDoc.id ? bestPair.targetId : bestPair.sourceId;
                  return (
                    <button
                      type="button"
                      onClick={() => onOpenComparison(selectedDoc.id, otherId)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare with Closest Match ({Math.round(bestPair.similarityScore * 100)}%)</span>
                    </button>
                  );
                }
                return null;
              })()}
              <button
                type="button"
                onClick={() => setSelectedDocId(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Similarity Results Pairwise Table */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">Document Similarity Matrix</h3>
            <span className="text-xs text-slate-400">({filteredPairs.length} pairs evaluated)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Pairs
              </button>
              <button
                type="button"
                onClick={() => setFilterType('exact')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'exact'
                    ? 'bg-red-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exact Duplicates ({report.exactDuplicatePairs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('near')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'near'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Near Duplicates ({report.nearDuplicatePairs.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-48 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Pairs List */}
        {filteredPairs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No document pairs matched the selected criteria.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPairs.map(pair => (
              <div
                key={`${pair.sourceId}-${pair.targetId}`}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {pair.sourceName}
                    </span>
                    <span className="text-slate-600">↔</span>
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {pair.targetName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {pair.isExactDuplicate ? (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Exact 100% Duplicate (Identical SHA-256)
                      </span>
                    ) : pair.isNearDuplicate ? (
                      <span className="text-amber-400 font-medium">
                        Near Duplicate (Threshold ≥ {Math.round(threshold * 100)}%)
                      </span>
                    ) : (
                      <span className="text-slate-500">Low Similarity</span>
                    )}

                    {pair.commonTerms.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[300px] text-slate-400">
                          Shared terms: {pair.commonTerms.slice(0, 4).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-base font-bold font-mono tabular-nums ${
                        pair.isExactDuplicate
                          ? 'text-red-400'
                          : pair.isNearDuplicate
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {Math.round(pair.similarityScore * 100)}%
                    </div>
                    <div className="text-[10px] text-slate-500">Cosine Score</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenComparison(pair.sourceId, pair.targetId)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Compare Diff</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
