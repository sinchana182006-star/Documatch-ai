/**
 * DocuMatch AI - Document & Analysis Service
 * Manages Supabase PostgreSQL, Storage, and persistent analysis data.
 * Enforces strict user isolation and reliable database synchronization.
 */

import { getSupabase } from './supabase';
import { extractDocumentText } from './textExtraction';
import {
  analyzeDocumentCollection,
  DocumentItem,
  DocumentAnalysisReport,
} from './similarityEngine';

export interface StoredDocument {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: 'pdf' | 'docx' | 'txt';
  file_size: number;
  content_hash: string;
  extracted_text: string;
  word_count: number;
  character_count: number;
  status: 'completed' | 'processing' | 'error';
  classification: 'exact_duplicate' | 'near_duplicate' | 'unique';
  highest_similarity_score: number;
  duplicate_of_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StoredAnalysisJob {
  id: string;
  user_id: string;
  name: string;
  status: 'completed' | 'running' | 'failed';
  total_documents: number;
  exact_duplicates_count: number;
  near_duplicates_count: number;
  unique_count: number;
  similarity_threshold: number;
  summary: any;
  created_at: string;
  completed_at: string;
}

export interface StoredSimilarity {
  id: string;
  job_id: string;
  user_id: string;
  source_doc_id: string;
  target_doc_id: string;
  similarity_score: number;
  relationship_type: 'exact_duplicate' | 'near_duplicate' | 'low_similarity';
  matching_ngrams_count: number;
  common_terms: string[];
  created_at: string;
}

export interface StoredHistoryItem {
  id: string;
  job_id?: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

// User-scoped cache helpers for offline resilience & immediate UI reactivity
const getDocCacheKey = (uid: string) => `documatch_cached_documents_${uid}`;
const getJobCacheKey = (uid: string) => `documatch_cached_jobs_${uid}`;
const getHistCacheKey = (uid: string) => `documatch_cached_history_${uid}`;

function getLocalDocs(userId: string): StoredDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getDocCacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDocs(userId: string, docs: StoredDocument[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getDocCacheKey(userId), JSON.stringify(docs));
  } catch {
    console.warn('LocalStorage limit reached for document text caching');
  }
}

function getLocalJobs(userId: string): StoredAnalysisJob[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getJobCacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalJobs(userId: string, jobs: StoredAnalysisJob[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getJobCacheKey(userId), JSON.stringify(jobs));
  } catch {}
}

function getLocalHistory(userId: string): StoredHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getHistCacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(userId: string, hist: StoredHistoryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getHistCacheKey(userId), JSON.stringify(hist));
  } catch {}
}

/**
 * Purges cached document and analysis data for a specific user upon sign out
 */
export function clearUserCache(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getDocCacheKey(userId));
  localStorage.removeItem(getJobCacheKey(userId));
  localStorage.removeItem(getHistCacheKey(userId));
}

/**
 * Normalizes and validates the MIME type according to the Supabase Storage bucket policy
 */
function getStorageMimeType(extension: string): string {
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
    default:
      return 'text/plain';
  }
}

/**
 * Uploads a document:
 * 1. Extracts real text and computes cryptographic SHA-256 content hash
 * 2. Uploads binary to private Supabase Storage bucket 'documents'
 * 3. Saves document record in Supabase PostgreSQL 'documents' table
 */
export async function uploadAndProcessDocument(
  file: File,
  userId: string
): Promise<StoredDocument> {
  const extension = (file.name.split('.').pop()?.toLowerCase() || 'txt') as 'pdf' | 'docx' | 'txt';
  const mimeType = getStorageMimeType(extension);

  // 1. Real text extraction & cryptographic SHA-256 hashing
  const extracted = await extractDocumentText(file);
  const docId = crypto.randomUUID();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${docId}_${cleanFileName}`;

  const client = getSupabase();
  const isGuest = !userId || userId === 'session-guest-user';

  if (client && !isGuest) {
    // 2. Upload to private Supabase Storage
    const { error: storageError } = await client.storage
      .from('documents')
      .upload(filePath, file, {
        upsert: true,
        contentType: mimeType,
      });

    if (storageError) {
      console.warn('Supabase Storage notice:', storageError.message);
    }

    // 3. Insert record in Supabase PostgreSQL 'documents' table
    const newDoc: StoredDocument = {
      id: docId,
      user_id: userId,
      name: file.name,
      file_path: filePath,
      file_type: extension,
      file_size: file.size,
      content_hash: extracted.contentHash,
      extracted_text: extracted.text,
      word_count: extracted.wordCount,
      character_count: extracted.characterCount,
      status: 'completed',
      classification: 'unique',
      highest_similarity_score: 0,
      duplicate_of_id: null,
      metadata: {
        linesCount: extracted.linesCount,
        sampleSnippet: extracted.sampleSnippet,
      },
      created_at: new Date().toISOString(),
    };

    const { data, error: dbError } = await client
      .from('documents')
      .insert(newDoc)
      .select()
      .single();

    if (!dbError && data) {
      const local = getLocalDocs(userId);
      saveLocalDocs(userId, [data, ...local.filter(d => d.id !== data.id)]);
      return data;
    }

    if (dbError) {
      console.warn('Supabase PostgreSQL documents insert notice:', dbError.message);
    }
  }

  // Local fallback record (when Supabase credentials are not yet configured)
  const fallbackDoc: StoredDocument = {
    id: docId,
    user_id: userId,
    name: file.name,
    file_path: filePath,
    file_type: extension,
    file_size: file.size,
    content_hash: extracted.contentHash,
    extracted_text: extracted.text,
    word_count: extracted.wordCount,
    character_count: extracted.characterCount,
    status: 'completed',
    classification: 'unique',
    highest_similarity_score: 0,
    duplicate_of_id: null,
    metadata: {
      linesCount: extracted.linesCount,
      sampleSnippet: extracted.sampleSnippet,
    },
    created_at: new Date().toISOString(),
  };

  const local = getLocalDocs(userId);
  saveLocalDocs(userId, [fallbackDoc, ...local.filter(d => d.id !== fallbackDoc.id)]);
  return fallbackDoc;
}

/**
 * Fetches all user documents from PostgreSQL isolated by auth user_id
 */
export async function fetchUserDocuments(userId: string): Promise<StoredDocument[]> {
  const client = getSupabase();
  const isGuest = !userId || userId === 'session-guest-user';

  if (client && !isGuest) {
    try {
      const { data, error } = await client
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        saveLocalDocs(userId, data);
        return data;
      }
      if (error) {
        console.warn('Supabase documents fetch notice:', error.message);
      }
    } catch (e: any) {
      console.warn('Could not query Supabase documents table:', e?.message || e);
    }
  }

  return getLocalDocs(userId);
}

/**
 * Deletes a document from PostgreSQL and private Storage
 */
export async function deleteDocument(doc: StoredDocument): Promise<boolean> {
  const client = getSupabase();
  const isGuest = !doc.user_id || doc.user_id === 'session-guest-user';

  if (client && !isGuest) {
    try {
      // 1. Delete binary from Storage
      if (doc.file_path) {
        await client.storage.from('documents').remove([doc.file_path]);
      }
      // 2. Delete row from PostgreSQL (foreign keys cascade to similarities)
      const { error: dbError } = await client.from('documents').delete().eq('id', doc.id);
      if (dbError) {
        console.warn('Notice deleting document from Supabase:', dbError.message);
      }
    } catch (e) {
      console.warn('Notice deleting from Supabase:', e);
    }
  }

  const local = getLocalDocs(doc.user_id);
  saveLocalDocs(doc.user_id, local.filter(d => d.id !== doc.id));
  return true;
}

/**
 * Runs full collection similarity analysis, computes pairs,
 * classifies documents, and stores the results in `analysis_jobs` & `document_similarities`
 */
export async function runBatchAnalysis(
  documents: StoredDocument[],
  userId: string,
  threshold = 0.70
): Promise<{
  report: DocumentAnalysisReport;
  job: StoredAnalysisJob;
}> {
  if (documents.length === 0) {
    throw new Error('No documents provided for analysis');
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

  const report = analyzeDocumentCollection(items, threshold);

  // Update classification and highest similarity in documents
  const updatedDocs = documents.map(doc => {
    const sum = report.documentSummaries.find(s => s.id === doc.id);
    if (sum) {
      return {
        ...doc,
        classification: sum.classification,
        highest_similarity_score: sum.highestSimilarity,
        duplicate_of_id: sum.mostSimilarDocId || null,
      };
    }
    return doc;
  });

  saveLocalDocs(userId, updatedDocs);

  const jobId = crypto.randomUUID();
  const job: StoredAnalysisJob = {
    id: jobId,
    user_id: userId,
    name: `Batch Analysis (${documents.length} Docs) - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    status: 'completed',
    total_documents: report.totalDocuments,
    exact_duplicates_count: report.exactDuplicatesCount,
    near_duplicates_count: report.nearDuplicatesCount,
    unique_count: report.uniqueDocumentsCount,
    similarity_threshold: threshold,
    summary: {
      exactPairsCount: report.exactDuplicatePairs.length,
      nearPairsCount: report.nearDuplicatePairs.length,
    },
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  const localJobs = getLocalJobs(userId);
  saveLocalJobs(userId, [job, ...localJobs]);

  const historyItem: StoredHistoryItem = {
    id: crypto.randomUUID(),
    job_id: jobId,
    user_id: userId,
    action_type: 'batch_analysis',
    description: `Analyzed ${documents.length} documents. Discovered ${report.exactDuplicatesCount} exact and ${report.nearDuplicatesCount} near duplicates.`,
    metadata: {
      total: report.totalDocuments,
      threshold,
      exact: report.exactDuplicatesCount,
      near: report.nearDuplicatesCount,
    },
    created_at: new Date().toISOString(),
  };

  const localHist = getLocalHistory(userId);
  saveLocalHistory(userId, [historyItem, ...localHist]);

  // Persist directly to Supabase PostgreSQL when connected
  const client = getSupabase();
  const isGuest = !userId || userId === 'session-guest-user';

  if (client && !isGuest) {
    try {
      // 1. Insert Job record
      const { error: jobErr } = await client.from('analysis_jobs').insert(job);
      if (jobErr) console.warn('Notice inserting analysis job:', jobErr.message);

      // 2. Insert Pairwise Similarities
      const simRows = report.matrix.map(p => ({
        id: crypto.randomUUID(),
        job_id: jobId,
        user_id: userId,
        source_doc_id: p.sourceId,
        target_doc_id: p.targetId,
        similarity_score: p.similarityScore,
        relationship_type: p.classification,
        common_terms: p.commonTerms,
        created_at: new Date().toISOString(),
      }));

      if (simRows.length > 0) {
        const { error: simErr } = await client.from('document_similarities').insert(simRows);
        if (simErr) console.warn('Notice inserting document similarities:', simErr.message);
      }

      // 3. Update documents with classifications
      for (const updatedDoc of updatedDocs) {
        await client
          .from('documents')
          .update({
            classification: updatedDoc.classification,
            highest_similarity_score: updatedDoc.highest_similarity_score,
            duplicate_of_id: updatedDoc.duplicate_of_id || null,
          })
          .eq('id', updatedDoc.id);
      }

      // 4. Insert Audit History
      const { error: histErr } = await client.from('analysis_history').insert(historyItem);
      if (histErr) console.warn('Notice inserting analysis history:', histErr.message);
    } catch (e) {
      console.warn('Could not sync batch analysis results to Supabase:', e);
    }
  }

  return { report, job };
}

/**
 * Fetches user analysis history from Supabase
 */
export async function fetchAnalysisHistory(userId: string): Promise<StoredHistoryItem[]> {
  const client = getSupabase();
  const isGuest = !userId || userId === 'session-guest-user';

  if (client && !isGuest) {
    try {
      const { data, error } = await client
        .from('analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        saveLocalHistory(userId, data);
        return data;
      }
    } catch (e) {
      console.warn('Could not fetch analysis history from Supabase:', e);
    }
  }

  return getLocalHistory(userId);
}

/**
 * Fetches previous analysis jobs from Supabase
 */
export async function fetchAnalysisJobs(userId: string): Promise<StoredAnalysisJob[]> {
  const client = getSupabase();
  const isGuest = !userId || userId === 'session-guest-user';

  if (client && !isGuest) {
    try {
      const { data, error } = await client
        .from('analysis_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        saveLocalJobs(userId, data);
        return data;
      }
    } catch (e) {
      console.warn('Could not fetch analysis jobs from Supabase:', e);
    }
  }

  return getLocalJobs(userId);
}
