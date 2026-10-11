/**
 * DocuMatch AI - Document Library
 * Search, filter, sorting, metadata inspection, downloads, and deletion with confirmation.
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  ArrowUpDown,
  Layers,
  AlertTriangle,
  X,
  CheckCircle,
  Copy,
  GitCompare,
} from 'lucide-react';
import { StoredDocument, deleteDocument } from '../lib/documentService';
import { getSupabase } from '../lib/supabase';

interface Props {
  documents: StoredDocument[];
  onDocumentDeleted: () => void;
  onOpenComparison: (docAId: string, docBId: string) => void;
  onNavigateToUpload: () => void;
}

export const DocumentLibrary: React.FC<Props> = ({
  documents,
  onDocumentDeleted,
  onOpenComparison,
  onNavigateToUpload,
}) => {
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx' | 'txt'>('all');
  const [classFilter, setClassFilter] = useState<'all' | 'exact_duplicate' | 'near_duplicate' | 'unique'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'size_desc'>('date_desc');

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<StoredDocument | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<StoredDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocs = useMemo(() => {
    return documents
      .filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        const matchesFormat = formatFilter === 'all' || doc.file_type === formatFilter;
        const matchesClass = classFilter === 'all' || doc.classification === classFilter;
        return matchesSearch && matchesFormat && matchesClass;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'size_desc') {
          return b.file_size - a.file_size;
        }
        return 0;
      });
  }, [documents, search, formatFilter, classFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteDocument(deleteTarget);
    setIsDeleting(false);
    setDeleteTarget(null);
    onDocumentDeleted();
  };

  const handleDownload = async (doc: StoredDocument) => {
    const client = getSupabase();
    if (client && doc.file_path) {
      try {
        const { data } = await client.storage.from('documents').createSignedUrl(doc.file_path, 300);
        if (data?.signedUrl) {
          const a = document.createElement('a');
          a.href = data.signedUrl;
          a.download = doc.name;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return;
        }
      } catch (e) {
        console.warn('Storage signed URL failed, downloading extracted text fallback');
      }
    }

    // Direct blob download fallback
    const blob = new Blob([doc.extracted_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.endsWith('.txt') ? doc.name : `${doc.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Document Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage repository files, inspect cryptographic hashes, download originals, and verify deduplication.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToUpload}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
        >
          + Upload More Documents
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#080f20]/60 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Format */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Format:</span>
            <select
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          {/* Classification */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="exact_duplicate">Exact Duplicate</option>
              <option value="near_duplicate">Near Duplicate</option>
              <option value="unique">Unique Document</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="size_desc">File Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-[#080e1d] text-xs text-slate-400 space-y-2">
          <p>No documents found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map(doc => {
            const isExact = doc.classification === 'exact_duplicate';
            const isNear = doc.classification === 'near_duplicate';

            return (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-800 bg-[#080f20]/60 hover:bg-[#080f20] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isExact
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : isNear
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{doc.name}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isExact
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : isNear
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isExact ? 'Exact Duplicate' : isNear ? 'Near Duplicate' : 'Unique'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2.5 mt-1">
                      <span className="font-mono uppercase">{doc.file_type}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{formatFileSize(doc.file_size)}</span>
                      <span>·</span>
                      <span className="tabular-nums">{doc.word_count} words</span>
                      <span>·</span>
                      <span className="font-mono truncate max-w-[150px] text-slate-500">
                        SHA: {doc.content_hash.slice(0, 10)}...
                      </span>
                      <span>·</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title="View Extracted Text & Metadata"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-cyan-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0e172c]">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{previewDoc.name}</span>
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  SHA-256: {previewDoc.content_hash}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
              {previewDoc.extracted_text}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0e172c] flex items-center justify-between text-xs text-slate-400">
              <div>
                <span>{previewDoc.word_count} words</span> ·{' '}
                <span>{previewDoc.character_count} characters</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1324] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Document</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.name}"</strong>?
              This will remove the file from both Supabase Storage and the PostgreSQL database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
