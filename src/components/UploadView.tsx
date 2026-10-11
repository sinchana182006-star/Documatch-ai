/**
 * DocuMatch AI - Document Upload & Processing Queue
 * Multi-file drag & drop, validation, progress tracking,
 * client-side text extraction + hashing, and Supabase Storage/PostgreSQL persistence.
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadAndProcessDocument, StoredDocument, runBatchAnalysis } from '../lib/documentService';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'queued' | 'extracting' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  extractedDoc?: StoredDocument;
}

interface Props {
  onAnalysisCompleted: () => void;
  onNavigateToAnalysis: () => void;
}

export const UploadView: React.FC<Props> = ({ onAnalysisCompleted, onNavigateToAnalysis }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    setUploadMessage(null);

    const validExtensions = ['pdf', 'docx', 'txt'];
    const newItems: QueuedFile[] = [];

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) {
        setUploadMessage(`File "${file.name}" ignored: Only PDF, DOCX, and TXT files are supported.`);
        return;
      }

      // Check for duplicate in existing queue
      const alreadyInQueue = queue.some(q => q.name === file.name && q.size === file.size);
      if (alreadyInQueue) {
        setUploadMessage(`File "${file.name}" is already in the upload queue.`);
        return;
      }

      newItems.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: ext,
        status: 'queued',
        progress: 0,
      });
    });

    setQueue(prev => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const removeQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  // Load realistic sample documents for instant testing
  const handleLoadSampleDocuments = () => {
    const sampleFiles: QueuedFile[] = SAMPLE_DOCUMENTS.map(s => {
      const blob = new Blob([s.text], { type: 'text/plain' });
      const file = new File([blob], s.name, { type: 'text/plain' });
      return {
        id: crypto.randomUUID(),
        file,
        name: s.name,
        size: file.size,
        type: 'txt',
        status: 'queued',
        progress: 0,
      };
    });

    setQueue(prev => {
      const existingNames = new Set(prev.map(p => p.name));
      const fresh = sampleFiles.filter(sf => !existingNames.has(sf.name));
      return [...prev, ...fresh];
    });

    setUploadMessage('Loaded 5 sample contract & document files into queue ready for analysis.');
  };

  // Process all queued files
  const processQueue = async () => {
    if (queue.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setUploadMessage(null);

    const userId = user?.id || 'session-guest-user';
    const processedDocuments: StoredDocument[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') {
        if (item.extractedDoc) processedDocuments.push(item.extractedDoc);
        continue;
      }

      // 1. Text extraction phase
      setQueue(prev =>
        prev.map(q => (q.id === item.id ? { ...q, status: 'extracting', progress: 35 } : q))
      );

      try {
        // 2. Uploading & DB insert phase
        setQueue(prev =>
          prev.map(q => (q.id === item.id ? { ...q, status: 'uploading', progress: 75 } : q))
        );

        const storedDoc = await uploadAndProcessDocument(item.file, userId);
        processedDocuments.push(storedDoc);

        setQueue(prev =>
          prev.map(q =>
            q.id === item.id
              ? { ...q, status: 'completed', progress: 100, extractedDoc: storedDoc }
              : q
          )
        );
      } catch (err: any) {
        console.error('Document processing failed:', err);
        setQueue(prev =>
          prev.map(q =>
            q.id === item.id ? { ...q, status: 'error', error: err?.message || 'Processing failed' } : q
          )
        );
      }
    }

    // Run batch analysis on all documents
    if (processedDocuments.length >= 2) {
      try {
        await runBatchAnalysis(processedDocuments, userId);
        onAnalysisCompleted();
      } catch (e) {
        console.warn('Batch similarity analysis completed with notice:', e);
      }
    }

    setIsProcessing(false);
  };

  const completedCount = queue.filter(q => q.status === 'completed').length;
  const queuedCount = queue.filter(q => q.status === 'queued').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Upload & Queue Documents</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest PDF, DOCX, and TXT files for cryptographic hashing and similarity vectorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLoadSampleDocuments}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load 5 Test Samples (NDA, Revisions, Invoice)</span>
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
          <span>{uploadMessage}</span>
          <button onClick={() => setUploadMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 shadow-xl shadow-cyan-950/40 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-[#091122]/50 hover:bg-[#091122]/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={e => handleFileSelection(e.target.files)}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Upload className="w-6 h-6 stroke-[2]" />
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              Drag & drop document files here, or <span className="text-cyan-400 underline">browse</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, DOCX, and TXT files up to 50 MB each.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>PDF: Text Streams</span>
            <span>·</span>
            <span>DOCX: WordML</span>
            <span>·</span>
            <span>TXT: UTF-8</span>
          </div>
        </div>
      </div>

      {/* Processing Queue Table */}
      {queue.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#080f20]/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">Document Processing Queue</h3>
              <span className="text-xs text-slate-400">
                ({queue.length} files · {completedCount} completed · {queuedCount} ready)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
                >
                  Clear Completed
                </button>
              )}
              <button
                type="button"
                onClick={processQueue}
                disabled={isProcessing || queuedCount === 0}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Document Queue...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Text & Ingest ({queuedCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-2">
            {queue.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase font-mono">{item.type}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{formatFileSize(item.size)}</span>
                      {item.extractedDoc && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400 tabular-nums">
                            {item.extractedDoc.word_count} words
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-400 truncate max-w-[140px]">
                            SHA: {item.extractedDoc.content_hash.slice(0, 10)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-4 shrink-0">
                  {item.status === 'queued' && (
                    <span className="text-slate-400 font-mono text-[11px]">Ready in Queue</span>
                  )}
                  {item.status === 'extracting' && (
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting text...</span>
                    </div>
                  )}
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing to Storage...</span>
                    </div>
                  )}
                  {item.status === 'completed' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Processed</span>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{item.error || 'Failed'}</span>
                    </div>
                  )}

                  {!isProcessing && item.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {completedCount >= 2 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onNavigateToAnalysis}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
              >
                <span>View Similarity Analysis & Results Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
