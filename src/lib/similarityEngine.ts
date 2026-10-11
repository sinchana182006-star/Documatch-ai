/**
 * DocuMatch AI - Similarity Engine
 * TF-IDF Cosine Similarity, N-gram Shingling, and Diff Tokenizer.
 */

// Common English stop words
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

export interface DocumentItem {
  id: string;
  name: string;
  contentHash: string;
  normalizedText: string;
  rawText: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
}

export interface PairwiseSimilarityResult {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  similarityScore: number; // 0.00 to 1.00
  isExactDuplicate: boolean;
  isNearDuplicate: boolean;
  classification: 'exact_duplicate' | 'near_duplicate' | 'unique';
  commonTerms: string[];
  sharedPhrases: string[];
}

export interface DocumentAnalysisReport {
  totalDocuments: number;
  exactDuplicatePairs: PairwiseSimilarityResult[];
  nearDuplicatePairs: PairwiseSimilarityResult[];
  uniqueDocumentsCount: number;
  exactDuplicatesCount: number;
  nearDuplicatesCount: number;
  matrix: PairwiseSimilarityResult[];
  documentSummaries: {
    id: string;
    name: string;
    classification: 'exact_duplicate' | 'near_duplicate' | 'unique';
    highestSimilarity: number;
    mostSimilarDocId?: string;
    mostSimilarDocName?: string;
  }[];
}

/**
 * Tokenizes string into meaningful word stems / lowercase tokens
 */
export function tokenize(text: string, removeStopwords = true): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (removeStopwords) {
    return tokens.filter(t => !STOP_WORDS.has(t));
  }
  return tokens;
}

/**
 * Extracts character or word n-grams (default 3 words)
 */
export function extractNGrams(tokens: string[], n = 3): string[] {
  if (tokens.length < n) return tokens.length > 0 ? [tokens.join(' ')] : [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Computes TF-IDF vector representations and calculates pairwise cosine similarity
 */
export function computeTfidfCosineSimilarity(
  docA: { text: string; hash: string },
  docB: { text: string; hash: string }
): {
  score: number;
  commonTerms: string[];
  sharedPhrases: string[];
} {
  // If hashes match exactly, 100% similarity
  if (docA.hash && docB.hash && docA.hash === docB.hash) {
    return {
      score: 1.0,
      commonTerms: ['Identical content hash'],
      sharedPhrases: ['100% Exact match across all paragraphs'],
    };
  }

  const tokensA = tokenize(docA.text, true);
  const tokensB = tokenize(docB.text, true);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return { score: 0, commonTerms: [], sharedPhrases: [] };
  }

  // Count frequencies
  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  for (const t of tokensA) freqA[t] = (freqA[t] || 0) + 1;
  for (const t of tokensB) freqB[t] = (freqB[t] || 0) + 1;

  // Build shared vocabulary
  const vocab = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  const N = 2; // two docs

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const sharedTokensWithScores: { term: string; score: number }[] = [];

  vocab.forEach(term => {
    const tfA = (freqA[term] || 0) / tokensA.length;
    const tfB = (freqB[term] || 0) / tokensB.length;

    // Document frequency
    let df = 0;
    if (freqA[term]) df++;
    if (freqB[term]) df++;

    const idf = Math.log(1 + (N / (1 + df))) + 1;

    const wA = tfA * idf;
    const wB = tfB * idf;

    dotProduct += wA * wB;
    normA += wA * wA;
    normB += wB * wB;

    if (wA > 0 && wB > 0) {
      sharedTokensWithScores.push({ term, score: wA * wB });
    }
  });

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  let cosineScore = magnitude > 0 ? dotProduct / magnitude : 0;

  // Jaccard similarity on 3-word ngrams (phrasing check)
  const ngramsA = new Set(extractNGrams(tokenize(docA.text, false), 3));
  const ngramsB = new Set(extractNGrams(tokenize(docB.text, false), 3));

  let sharedNGramsCount = 0;
  const sharedPhrasesSample: string[] = [];
  ngramsA.forEach(phrase => {
    if (ngramsB.has(phrase)) {
      sharedNGramsCount++;
      if (sharedPhrasesSample.length < 5) {
        sharedPhrasesSample.push(phrase);
      }
    }
  });

  const unionSize = new Set([...ngramsA, ...ngramsB]).size;
  const jaccardScore = unionSize > 0 ? sharedNGramsCount / unionSize : 0;

  // Hybrid blend: 75% TF-IDF Cosine, 25% Phrasing Jaccard
  let blendedScore = cosineScore * 0.75 + jaccardScore * 0.25;
  blendedScore = Math.min(1.0, Math.max(0.0, blendedScore));

  // Sort common terms by significance
  sharedTokensWithScores.sort((a, b) => b.score - a.score);
  const commonTerms = sharedTokensWithScores.slice(0, 10).map(item => item.term);

  return {
    score: Math.round(blendedScore * 1000) / 1000,
    commonTerms,
    sharedPhrases: sharedPhrasesSample,
  };
}

/**
 * Analyzes a collection of documents and computes all pairwise relationships
 */
export function analyzeDocumentCollection(
  documents: DocumentItem[],
  nearDuplicateThreshold = 0.70
): DocumentAnalysisReport {
  const n = documents.length;
  const matrix: PairwiseSimilarityResult[] = [];
  const exactPairs: PairwiseSimilarityResult[] = [];
  const nearPairs: PairwiseSimilarityResult[] = [];

  // Track each document's highest similarity
  const highestSimMap: Record<
    string,
    { score: number; docId?: string; docName?: string; isExact: boolean }
  > = {};

  documents.forEach(d => {
    highestSimMap[d.id] = { score: 0, isExact: false };
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const docA = documents[i];
      const docB = documents[j];

      const sim = computeTfidfCosineSimilarity(
        { text: docA.normalizedText, hash: docA.contentHash },
        { text: docB.normalizedText, hash: docB.contentHash }
      );

      const isExact = docA.contentHash === docB.contentHash;
      const isNear = !isExact && sim.score >= nearDuplicateThreshold;

      const classification = isExact
        ? 'exact_duplicate'
        : isNear
        ? 'near_duplicate'
        : 'unique';

      const pairResult: PairwiseSimilarityResult = {
        sourceId: docA.id,
        sourceName: docA.name,
        targetId: docB.id,
        targetName: docB.name,
        similarityScore: isExact ? 1.0 : sim.score,
        isExactDuplicate: isExact,
        isNearDuplicate: isNear,
        classification,
        commonTerms: sim.commonTerms,
        sharedPhrases: sim.sharedPhrases,
      };

      matrix.push(pairResult);

      if (isExact) {
        exactPairs.push(pairResult);
      } else if (isNear) {
        nearPairs.push(pairResult);
      }

      // Update max similarity for docA
      if (pairResult.similarityScore > highestSimMap[docA.id].score) {
        highestSimMap[docA.id] = {
          score: pairResult.similarityScore,
          docId: docB.id,
          docName: docB.name,
          isExact,
        };
      }

      // Update max similarity for docB
      if (pairResult.similarityScore > highestSimMap[docB.id].score) {
        highestSimMap[docB.id] = {
          score: pairResult.similarityScore,
          docId: docA.id,
          docName: docA.name,
          isExact,
        };
      }
    }
  }

  // Determine classification per document
  let exactDuplicatesCount = 0;
  let nearDuplicatesCount = 0;
  let uniqueDocumentsCount = 0;

  const documentSummaries = documents.map(d => {
    const meta = highestSimMap[d.id];
    let classification: 'exact_duplicate' | 'near_duplicate' | 'unique' = 'unique';

    if (meta.isExact) {
      classification = 'exact_duplicate';
      exactDuplicatesCount++;
    } else if (meta.score >= nearDuplicateThreshold) {
      classification = 'near_duplicate';
      nearDuplicatesCount++;
    } else {
      uniqueDocumentsCount++;
    }

    return {
      id: d.id,
      name: d.name,
      classification,
      highestSimilarity: meta.score,
      mostSimilarDocId: meta.docId,
      mostSimilarDocName: meta.docName,
    };
  });

  return {
    totalDocuments: n,
    exactDuplicatePairs: exactPairs,
    nearDuplicatePairs: nearPairs,
    uniqueDocumentsCount,
    exactDuplicatesCount,
    nearDuplicatesCount,
    matrix,
    documentSummaries,
  };
}

/**
 * Generates side-by-side word diff comparison
 */
export interface DiffChunk {
  type: 'identical' | 'added' | 'removed';
  value: string;
}

export function computeWordDiff(textA: string, textB: string): {
  leftChunks: DiffChunk[];
  rightChunks: DiffChunk[];
} {
  const wordsA = textA.split(/(\s+)/).filter(Boolean);
  const wordsB = textB.split(/(\s+)/).filter(Boolean);

  // Simplified diff algorithm using a sliding window for high performance
  const setB = new Set(wordsB.map(w => w.trim().toLowerCase()).filter(w => w.length > 2));
  const setA = new Set(wordsA.map(w => w.trim().toLowerCase()).filter(w => w.length > 2));

  const leftChunks: DiffChunk[] = wordsA.map(w => {
    const clean = w.trim().toLowerCase();
    if (!clean || clean.length <= 2) return { type: 'identical', value: w };
    return {
      type: setB.has(clean) ? 'identical' : 'removed',
      value: w,
    };
  });

  const rightChunks: DiffChunk[] = wordsB.map(w => {
    const clean = w.trim().toLowerCase();
    if (!clean || clean.length <= 2) return { type: 'identical', value: w };
    return {
      type: setA.has(clean) ? 'identical' : 'added',
      value: w,
    };
  });

  return { leftChunks, rightChunks };
}
