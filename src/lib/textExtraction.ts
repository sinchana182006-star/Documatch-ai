/**
 * DocuMatch AI - Text Extraction & Normalization Engine
 * Handles PDF, DOCX, and TXT files with SHA-256 content hashing.
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdf.js worker to use the local Vite-bundled worker asset
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export interface ExtractedDocumentData {
  text: string;
  normalizedText: string;
  contentHash: string;
  wordCount: number;
  characterCount: number;
  linesCount: number;
  sampleSnippet: string;
}

/**
 * Computes a standard cryptographic SHA-256 hex hash
 */
export async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalizes text for clean semantic and similarity matching:
 * Lowercases, strips excessive special characters, collapses whitespace, trims.
 */
export function normalizeText(rawText: string): string {
  return rawText
    .toLowerCase()
    .replace(/[^\w\s.,!?-]/g, ' ') // replace obscure symbols with space
    .replace(/\s+/g, ' ')           // collapse multiple spaces, tabs, newlines
    .trim();
}

/**
 * Extracts raw text from a TXT file
 */
export async function extractFromTxt(file: File): Promise<string> {
  return await file.text();
}

/**
 * Extracts raw text from a DOCX file using Mammoth
 */
export async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Fallback parser to extract text streams directly from PDF binary buffer
 * if pdf.js or web worker encounter environment issues.
 */
function extractTextFromPdfBinary(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('latin1');
  const rawString = decoder.decode(buffer);
  const textPieces: string[] = [];

  // Match text bracketed in PDF operators: (text) Tj or [(text)(more)] TJ
  const tjMatches = rawString.match(/\((.*?)\)\s*Tj/g) || [];
  for (const m of tjMatches) {
    const clean = m.replace(/^[(\s]+|[)\s]+Tj$/g, '').trim();
    if (clean) textPieces.push(clean);
  }

  const tjArrayMatches = rawString.match(/\[(.*?)\]\s*TJ/g) || [];
  for (const arr of tjArrayMatches) {
    const inside = arr.match(/\((.*?)\)/g) || [];
    for (const piece of inside) {
      const clean = piece.replace(/[()]/g, '').trim();
      if (clean) textPieces.push(clean);
    }
  }

  // Also check for readable ASCII paragraphs in streams
  if (textPieces.length === 0) {
    const asciiWords = rawString.match(/[A-Za-z0-9,.:;'"!?-]{3,}/g) || [];
    const filtered = asciiWords.filter(w => !['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref', 'FlateDecode', 'Filter', 'Length'].includes(w));
    if (filtered.length > 10) {
      return filtered.join(' ');
    }
  }

  return textPieces.join(' ').replace(/\\([()\\])/g, '$1');
}

/**
 * Extracts text from a PDF file using PDF.js with native worker & robust fallback
 */
export async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      fullText += pageStrings.join(' ') + '\n';
    }

    if (fullText.trim()) {
      return fullText;
    }
  } catch (err: any) {
    console.warn('PDF.js worker or parsing warning, executing resilient binary extractor:', err);
  }

  // Robust secondary binary extraction fallback
  const fallbackText = extractTextFromPdfBinary(arrayBuffer);
  if (fallbackText.trim()) {
    return fallbackText;
  }

  return `[PDF Document: ${file.name} - Formatted structure without extractable plaintext]`;
}

/**
 * Universal text extractor for supported formats
 */
export async function extractDocumentText(file: File): Promise<ExtractedDocumentData> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let rawText = '';

  if (extension === 'txt' || file.type === 'text/plain') {
    rawText = await extractFromTxt(file);
  } else if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractFromDocx(file);
  } else if (extension === 'pdf' || file.type === 'application/pdf') {
    rawText = await extractFromPdf(file);
  } else {
    throw new Error(`Unsupported file type: .${extension}. Only PDF, DOCX, and TXT are supported.`);
  }

  const normalized = normalizeText(rawText);
  const contentHash = await computeSHA256(normalized.length > 0 ? normalized : rawText);
  
  const words = normalized.length > 0 ? normalized.split(/\s+/).filter(Boolean) : [];
  const lines = rawText.split('\n');
  const sampleSnippet = rawText.slice(0, 300).trim();

  return {
    text: rawText,
    normalizedText: normalized,
    contentHash,
    wordCount: words.length,
    characterCount: rawText.length,
    linesCount: lines.length,
    sampleSnippet: sampleSnippet || '(Empty document)',
  };
}
