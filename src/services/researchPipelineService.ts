/**
 * src/services/researchPipelineService.ts
 *
 * Frontend service that orchestrates the full research pipeline:
 * 1. Search (calls /api/research/search)
 * 2. Full-text fetch (calls /api/research/fetch-fulltext for open-access papers)
 * 3. Synthesis (calls /api/research/synthesise)
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export type ResearchField =
  | 'cs' | 'electrical' | 'mechanical' | 'civil' | 'chemical'
  | 'medicine' | 'nursing' | 'biology' | 'environmental'
  | 'business' | 'economics' | 'finance' | 'law'
  | 'education' | 'psychology' | 'sociology' | 'political-science'
  | 'humanities' | 'agriculture' | 'general';

export interface EnrichedPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  journal: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
  citationCount: number;
  sourceDatabase: string;
  fullTextStatus: 'open-access' | 'paywalled' | 'unknown';
  relevanceScore: number;
  fullText?: string; // populated after Obscura fetch
}

export interface LibraryQueueItem {
  paper: EnrichedPaper;
  priority: 'critical' | 'important' | 'supplementary';
  priorityReason: string;
  accessLinks: {
    doi: string;
    semanticScholar: string;
    googleScholar: string;
    researchGate: string;
    openAlexOa?: string;
    universityLibrary?: string; // set by frontend using universityResolver
  };
  uploaded: boolean;
  uploadedFullText?: string;
}

export interface ResearchPipelineResult {
  field: ResearchField;
  fieldLabel: string;
  databases: string[];
  papers: EnrichedPaper[];
  openAccessCount: number;
  paywalledCount: number;
  unknownCount: number;
  coveragePercent: number;
  libraryQueue: LibraryQueueItem[];
  totalFound: number;
}

export interface SynthesisResult {
  studies: StudyEntry[];
  annotatedBibliography: string;
  empiricalMatrix: string;
  thematicNarrative: string;
  researchGapSummary: string;
  coverageNote: string;
  providerUsed?: string;
  modelUsed?: string;
}

export interface StudyEntry {
  authorYear: string;
  title: string;
  journal: string;
  doi?: string;
  problemStatement: string;
  sampleSize: string;
  methodology: string;
  keyFindings: string;
  researchGap: string;
  confidence: 'verified' | 'ai-summarised' | 'ai-synthesised';
}

// ─── Step 1: Search ────────────────────────────────────────────────────────────

export async function searchLiterature(
  topic: string,
  targetCount: number = 20
): Promise<ResearchPipelineResult> {
  const res = await fetch(`${API_BASE}/api/research/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, targetCount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(err.error || `Search failed: HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Step 2: Fetch full texts for open-access papers ─────────────────────────

export async function fetchFullTexts(
  papers: EnrichedPaper[],
  onProgress?: (done: number, total: number) => void
): Promise<EnrichedPaper[]> {
  const openAccess = papers.filter(p => p.fullTextStatus === 'open-access' && p.pdfUrl);
  const enriched = [...papers];
  let done = 0;

  // Fetch in batches of 3 to avoid overwhelming Obscura
  for (let i = 0; i < openAccess.length; i += 3) {
    const batch = openAccess.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async (paper) => {
        try {
          const res = await fetch(`${API_BASE}/api/research/fetch-fulltext`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: paper.pdfUrl }),
          });
          if (!res.ok) return { id: paper.id, text: null };
          const data = await res.json();
          return { id: paper.id, text: data.text };
        } catch {
          return { id: paper.id, text: null };
        }
      })
    );

    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.text) {
        const idx = enriched.findIndex(p => p.id === r.value.id);
        if (idx !== -1) enriched[idx] = { ...enriched[idx], fullText: r.value.text };
      }
    });

    done += batch.length;
    onProgress?.(done, openAccess.length);
  }

  return enriched;
}

// ─── Step 3: Synthesise ───────────────────────────────────────────────────────

export async function synthesiseLiterature(
  topic: string,
  papers: EnrichedPaper[],
  uploadedPapers: { text: string; fileName: string }[] = [],
  style: 'annotated' | 'empirical' | 'narrative' = 'annotated'
): Promise<SynthesisResult> {
  // Read the user's configured AI provider from localStorage (same as rest of WriteWise)
  const provider = localStorage.getItem('apiProvider')?.trim() || 'Gemini';
  const apiKey   = localStorage.getItem('apiKey')?.trim() || '';
  const model    = localStorage.getItem('apiModel')?.trim() || '';

  // Merge uploaded papers as additional full-text entries
  const paperInputs = papers.map(p => ({
    title: p.title,
    authors: p.authors,
    year: p.year,
    journal: p.journal,
    doi: p.doi,
    abstract: p.abstract,
    fullText: p.fullText,
    citationCount: p.citationCount,
    fullTextStatus: p.fullTextStatus,
  }));

  // Uploaded PDFs from Library Queue — treat as high-confidence full-text papers
  const uploadedInputs = uploadedPapers.map(u => ({
    title: u.fileName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '),
    authors: ['(User uploaded)'],
    year: String(new Date().getFullYear()),
    journal: 'User-provided PDF',
    fullText: u.text,
    citationCount: 0,
    fullTextStatus: 'open-access' as const,
  }));

  const res = await fetch(`${API_BASE}/api/research/synthesise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      papers: [...paperInputs, ...uploadedInputs],
      style,
      // Pass AI credentials — backend falls back to server default if empty
      provider,
      apiKey,
      model,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Synthesis failed' }));
    throw new Error(err.error || `Synthesis failed: HTTP ${res.status}`);
  }

  return res.json();
}


// ─── Coverage calculation ──────────────────────────────────────────────────────

export interface CoverageStats {
  total: number;
  fullText: number;
  abstractOnly: number;
  paywalled: number;
  uploaded: number;
  coveragePercent: number;
  recommendation: string;
}

export function calculateCoverage(
  papers: EnrichedPaper[],
  libraryQueue: LibraryQueueItem[]
): CoverageStats {
  const fullText = papers.filter(p => p.fullText && p.fullText.length > 200).length;
  const abstractOnly = papers.filter(p => !p.fullText && p.abstract && p.abstract.length > 80).length;
  const paywalled = papers.filter(p => p.fullTextStatus === 'paywalled' && !p.fullText).length;
  const uploaded = libraryQueue.filter(q => q.uploaded).length;
  const total = papers.length;
  const coveragePercent = total > 0 ? Math.round(((fullText + uploaded) / total) * 100) : 0;

  let recommendation = '';
  const criticalUnuploaded = libraryQueue.filter(q => q.priority === 'critical' && !q.uploaded).length;
  if (criticalUnuploaded > 0) {
    recommendation = `Upload ${criticalUnuploaded} critical paper${criticalUnuploaded > 1 ? 's' : ''} from the Library Queue for a near-complete review.`;
  } else if (coveragePercent >= 80) {
    recommendation = 'Excellent coverage — ready to generate a comprehensive literature review.';
  } else if (coveragePercent >= 60) {
    recommendation = 'Good coverage — you can generate now or upload more papers for greater depth.';
  } else {
    recommendation = 'Moderate coverage — consider uploading more papers from the Library Queue.';
  }

  return { total, fullText, abstractOnly, paywalled, uploaded, coveragePercent, recommendation };
}
