/**
 * api/research-search.ts
 * POST /api/research/search
 *
 * Multi-database academic paper discovery.
 * Detects the research field, queries all appropriate databases in parallel,
 * deduplicates, enriches with Unpaywall, and returns ranked results.
 *
 * Body: { topic: string, targetCount?: number }
 * Returns: ResearchPipelineResult
 */

import type { Request, Response } from 'express';

const SEMANTIC_SCHOLAR_BASE = 'https://api.semanticscholar.org/graph/v1';
const OPENALEX_BASE = 'https://api.openalex.org';
const CROSSREF_BASE = 'https://api.crossref.org';
const EUROPEPMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const CORE_BASE = 'https://api.core.ac.uk/v3';
const ERIC_BASE = 'https://api.ies.ed.gov/eric';
const UNPAYWALL_BASE = 'https://api.unpaywall.org/v2';

const UNPAYWALL_EMAIL = 'research@writewise.ai'; // required by Unpaywall ToS

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
  pdfUrl?: string;       // Unpaywall-resolved free PDF URL
  abstract?: string;
  citationCount: number;
  sourceDatabase: string;
  fullTextStatus: 'open-access' | 'paywalled' | 'unknown';
  relevanceScore: number;
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
  };
}

// ─── Field Detection ───────────────────────────────────────────────────────────

const FIELD_KEYWORDS: Record<ResearchField, string[]> = {
  cs: ['algorithm', 'software', 'machine learning', 'deep learning', 'neural network', 'artificial intelligence', 'computer', 'programming', 'cybersecurity', 'blockchain', 'natural language processing', 'nlp', 'computer vision', 'database', 'cloud computing', 'iot', 'internet of things'],
  electrical: ['circuit', 'signal processing', 'power systems', 'electromagnetic', 'antenna', 'MIMO', 'wireless', 'semiconductor', 'VLSI', 'microcontroller', '5G', '4G', 'telecommunications', 'radar', 'photovoltaic', 'renewable energy'],
  mechanical: ['thermodynamics', 'fluid dynamics', 'heat transfer', 'manufacturing', 'robotics', 'CAD', 'finite element', 'tribology', 'material science', 'fatigue', 'vibration', 'turbine', 'combustion', 'nanotechnology', 'MEMS'],
  civil: ['structural engineering', 'concrete', 'geotechnical', 'foundation', 'bridge', 'pavement', 'traffic', 'transportation', 'water resources', 'hydraulics', 'soil', 'earthquake', 'construction management', 'urban planning', 'infrastructure'],
  chemical: ['reaction kinetics', 'catalysis', 'polymer', 'petrochemical', 'distillation', 'thermochemistry', 'biochemical engineering', 'separation process', 'corrosion', 'process design'],
  medicine: ['clinical trial', 'patient', 'disease', 'treatment', 'diagnosis', 'surgery', 'pharmacology', 'drug', 'cancer', 'diabetes', 'cardiovascular', 'HIV', 'malaria', 'vaccine', 'epidemiology', 'mortality', 'morbidity', 'randomized controlled'],
  nursing: ['nursing', 'nurse', 'patient care', 'healthcare', 'midwifery', 'palliative', 'wound care', 'mental health nursing', 'community health'],
  biology: ['genetics', 'genomics', 'molecular biology', 'cell biology', 'microbiology', 'ecology', 'evolution', 'biochemistry', 'proteomics', 'CRISPR', 'biodiversity', 'species', 'ecosystem'],
  environmental: ['climate change', 'global warming', 'pollution', 'sustainability', 'carbon emission', 'greenhouse gas', 'waste management', 'water quality', 'air quality', 'deforestation', 'biodiversity loss', 'renewable', 'environmental impact'],
  business: ['management', 'organizational', 'leadership', 'strategy', 'supply chain', 'marketing', 'entrepreneurship', 'corporate governance', 'SME', 'firm performance', 'competitive advantage', 'business model', 'innovation'],
  economics: ['GDP', 'inflation', 'monetary policy', 'fiscal policy', 'trade', 'macroeconomic', 'microeconomic', 'labour market', 'unemployment', 'economic growth', 'poverty', 'inequality', 'development economics'],
  finance: ['stock market', 'portfolio', 'investment', 'financial performance', 'capital structure', 'dividend', 'financial risk', 'banking', 'insurance', 'cryptocurrency', 'fintech', 'asset pricing', 'return on equity'],
  law: ['legal', 'legislation', 'regulation', 'judiciary', 'criminal', 'contract', 'constitutional', 'human rights', 'intellectual property', 'tort', 'corporate law', 'international law'],
  education: ['teaching', 'learning', 'curriculum', 'pedagogy', 'student', 'academic performance', 'e-learning', 'higher education', 'primary education', 'secondary education', 'STEM education', 'educational technology', 'assessment', 'literacy'],
  psychology: ['cognition', 'behaviour', 'mental health', 'depression', 'anxiety', 'personality', 'motivation', 'stress', 'trauma', 'therapy', 'counselling', 'cognitive behavioral', 'psychotherapy', 'wellbeing'],
  sociology: ['society', 'social inequality', 'gender', 'race', 'ethnicity', 'migration', 'urbanization', 'family structure', 'social capital', 'community', 'social network', 'crime', 'deviance'],
  'political-science': ['governance', 'democracy', 'election', 'political party', 'policy', 'government', 'public administration', 'geopolitics', 'international relations', 'conflict', 'corruption', 'accountability'],
  humanities: ['literature', 'history', 'philosophy', 'culture', 'art', 'music', 'religion', 'language', 'linguistics', 'archaeology', 'anthropology', 'ethics'],
  agriculture: ['crop', 'farming', 'soil fertility', 'irrigation', 'livestock', 'agronomy', 'food security', 'pesticide', 'fertilizer', 'aquaculture', 'food production', 'agricultural yield'],
  general: [],
};

const FIELD_LABELS: Record<ResearchField, string> = {
  cs: 'Computer Science & Software Engineering',
  electrical: 'Electrical & Electronic Engineering',
  mechanical: 'Mechanical Engineering',
  civil: 'Civil & Structural Engineering',
  chemical: 'Chemical Engineering',
  medicine: 'Medicine & Clinical Sciences',
  nursing: 'Nursing & Allied Health',
  biology: 'Biology & Life Sciences',
  environmental: 'Environmental Science',
  business: 'Business & Management',
  economics: 'Economics',
  finance: 'Finance & Accounting',
  law: 'Law & Legal Studies',
  education: 'Education',
  psychology: 'Psychology',
  sociology: 'Sociology',
  'political-science': 'Political Science & Public Administration',
  humanities: 'Humanities',
  agriculture: 'Agriculture & Food Science',
  general: 'General / Multidisciplinary',
};

function detectField(topic: string): ResearchField {
  const lower = topic.toLowerCase();
  let bestField: ResearchField = 'general';
  let bestScore = 0;

  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (field === 'general') continue;
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestField = field as ResearchField;
    }
  }
  return bestField;
}

// ─── Database selectors ────────────────────────────────────────────────────────

function getDatabasesForField(field: ResearchField): string[] {
  const always = ['semantic-scholar', 'openalex', 'crossref'];
  const fieldSpecific: Record<ResearchField, string[]> = {
    cs: ['arxiv'],
    electrical: ['engrxiv'],
    mechanical: ['engrxiv'],
    civil: ['engrxiv'],
    chemical: ['chemrxiv'],
    medicine: ['europepmc'],
    nursing: ['europepmc'],
    biology: ['europepmc', 'arxiv'],
    environmental: ['europepmc'],
    business: ['ssrn'],
    economics: ['ssrn'],
    finance: ['ssrn'],
    law: ['ssrn'],
    education: ['eric'],
    psychology: ['europepmc'],
    sociology: ['ssrn'],
    'political-science': ['ssrn'],
    humanities: [],
    agriculture: ['europepmc'],
    general: ['europepmc'],
  };
  return [...always, ...(fieldSpecific[field] || []), 'core'];
}

// ─── Individual searchers ──────────────────────────────────────────────────────

async function searchSemanticScholar(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${SEMANTIC_SCHOLAR_BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,venue,publicationVenue,openAccessPdf,citationCount,externalIds,abstract`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((p: any): EnrichedPaper => ({
      id: `s2-${p.paperId}`,
      title: p.title || 'Untitled',
      authors: (p.authors || []).map((a: any) => a.name),
      year: String(p.year || new Date().getFullYear()),
      journal: p.publicationVenue?.name || p.venue || 'Unknown Journal',
      doi: p.externalIds?.DOI,
      url: p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : undefined,
      pdfUrl: p.openAccessPdf?.url,
      abstract: p.abstract,
      citationCount: p.citationCount || 0,
      sourceDatabase: 'Semantic Scholar',
      fullTextStatus: p.openAccessPdf?.url ? 'open-access' : 'unknown',
      relevanceScore: 0,
    }));
  } catch { return []; }
}

async function searchOpenAlex(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${OPENALEX_BASE}/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=id,title,authorships,publication_year,primary_location,doi,open_access,cited_by_count,abstract_inverted_index&mailto=research@writewise.ai`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((w: any): EnrichedPaper => {
      // Reconstruct abstract from inverted index
      let abstract: string | undefined;
      if (w.abstract_inverted_index) {
        try {
          const wordPositions: [string, number][] = [];
          for (const [word, positions] of Object.entries(w.abstract_inverted_index as Record<string, number[]>)) {
            (positions as number[]).forEach(pos => wordPositions.push([word, pos]));
          }
          wordPositions.sort((a, b) => a[1] - b[1]);
          abstract = wordPositions.map(([w]) => w).join(' ');
        } catch { /* ignore */ }
      }
      return {
        id: `oa-${w.id?.split('/').pop()}`,
        title: w.title || 'Untitled',
        authors: (w.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean),
        year: String(w.publication_year || new Date().getFullYear()),
        journal: w.primary_location?.source?.display_name || 'Unknown Journal',
        doi: w.doi?.replace('https://doi.org/', ''),
        url: w.doi,
        pdfUrl: w.open_access?.oa_url,
        abstract,
        citationCount: w.cited_by_count || 0,
        sourceDatabase: 'OpenAlex',
        fullTextStatus: w.open_access?.is_oa ? 'open-access' : 'unknown',
        relevanceScore: 0,
      };
    });
  } catch { return []; }
}

async function searchCrossref(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${CROSSREF_BASE}/works?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,published,container-title,is-referenced-by-count,abstract,URL,link`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.message?.items || []).map((item: any): EnrichedPaper => {
      const year = item.published?.['date-parts']?.[0]?.[0];
      const pdfLink = (item.link || []).find((l: any) => l['content-type'] === 'application/pdf')?.URL;
      return {
        id: `cr-${item.DOI?.replace(/\//g, '-')}`,
        title: Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled',
        authors: (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()),
        year: String(year || new Date().getFullYear()),
        journal: Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || 'Unknown',
        doi: item.DOI,
        url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
        pdfUrl: pdfLink,
        abstract: typeof item.abstract === 'string' ? item.abstract.replace(/<[^>]+>/g, '') : undefined,
        citationCount: item['is-referenced-by-count'] || 0,
        sourceDatabase: 'CrossRef',
        fullTextStatus: pdfLink ? 'open-access' : 'unknown',
        relevanceScore: 0,
      };
    });
  } catch { return []; }
}

async function searchEuropePMC(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${EUROPEPMC_BASE}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&resultType=core`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.resultList?.result || []).map((item: any): EnrichedPaper => ({
      id: `pmc-${item.id || item.pmid || Math.random().toString(36).substring(2)}`,
      title: item.title || 'Untitled',
      authors: (item.authorString || '').split(',').map((n: string) => n.trim()).filter(Boolean),
      year: String(item.pubYear || new Date().getFullYear()),
      journal: item.journalTitle || 'Unknown Journal',
      doi: item.doi,
      url: item.doi ? `https://doi.org/${item.doi}` : item.fullTextUrlList?.fullTextUrl?.[0]?.url,
      pdfUrl: item.fullTextUrlList?.fullTextUrl?.find((u: any) => u.documentStyle === 'pdf')?.url,
      abstract: item.abstractText,
      citationCount: item.citedByCount || 0,
      sourceDatabase: 'Europe PMC',
      fullTextStatus: item.inPMC === 'Y' ? 'open-access' : 'unknown',
      relevanceScore: 0,
    }));
  } catch { return []; }
}

async function searchCORE(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${CORE_BASE}/search/works?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any): EnrichedPaper => ({
      id: `core-${item.id}`,
      title: item.title || 'Untitled',
      authors: (item.authors || []).map((a: any) => a.name || a),
      year: String(item.yearPublished || new Date().getFullYear()),
      journal: item.journals?.[0]?.title || item.publisher || 'Unknown',
      doi: item.doi,
      url: item.doi ? `https://doi.org/${item.doi}` : item.downloadUrl,
      pdfUrl: item.downloadUrl,
      abstract: item.abstract,
      citationCount: 0,
      sourceDatabase: 'CORE',
      fullTextStatus: item.downloadUrl ? 'open-access' : 'unknown',
      relevanceScore: 0,
    }));
  } catch { return []; }
}

async function searchERIC(query: string, limit: number): Promise<EnrichedPaper[]> {
  try {
    const url = `${ERIC_BASE}?search=${encodeURIComponent(query)}&rows=${limit}&fields=id,title,author,description,publicationdateyear,sourcetitle,issn,url,peerreviewed`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.docs || []).map((item: any): EnrichedPaper => ({
      id: `eric-${item.id}`,
      title: item.title || 'Untitled',
      authors: Array.isArray(item.author) ? item.author : [item.author].filter(Boolean),
      year: String(item.publicationdateyear || new Date().getFullYear()),
      journal: item.sourcetitle || 'ERIC Database',
      doi: undefined,
      url: item.url || `https://eric.ed.gov/?id=${item.id}`,
      pdfUrl: item.url?.endsWith('.pdf') ? item.url : undefined,
      abstract: item.description,
      citationCount: 0,
      sourceDatabase: 'ERIC',
      fullTextStatus: item.url ? 'open-access' : 'unknown',
      relevanceScore: 0,
    }));
  } catch { return []; }
}

// ─── Unpaywall enrichment ──────────────────────────────────────────────────────

async function enrichWithUnpaywall(papers: EnrichedPaper[]): Promise<EnrichedPaper[]> {
  const enriched = await Promise.all(
    papers.map(async (paper) => {
      if (!paper.doi || paper.fullTextStatus === 'open-access') return paper;
      try {
        const url = `${UNPAYWALL_BASE}/${encodeURIComponent(paper.doi)}?email=${UNPAYWALL_EMAIL}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
        if (!res.ok) return paper;
        const data = await res.json();
        if (data.is_oa && data.best_oa_location?.url_for_pdf) {
          return {
            ...paper,
            pdfUrl: data.best_oa_location.url_for_pdf,
            fullTextStatus: 'open-access' as const,
          };
        }
        if (data.is_oa === false) {
          return { ...paper, fullTextStatus: 'paywalled' as const };
        }
      } catch { /* ignore */ }
      return paper;
    })
  );
  return enriched;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function deduplicatePapers(papers: EnrichedPaper[]): EnrichedPaper[] {
  const seenDoi = new Set<string>();
  const seenTitle = new Set<string>();
  const result: EnrichedPaper[] = [];

  for (const paper of papers) {
    const normTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
    if (paper.doi && seenDoi.has(paper.doi)) continue;
    if (seenTitle.has(normTitle)) continue;
    if (paper.doi) seenDoi.add(paper.doi);
    seenTitle.add(normTitle);
    result.push(paper);
  }
  return result;
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

function scorePapers(papers: EnrichedPaper[], query: string): EnrichedPaper[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const currentYear = new Date().getFullYear();

  return papers.map(paper => {
    const titleLower = paper.title.toLowerCase();
    const titleMatch = queryWords.filter(w => titleLower.includes(w)).length / queryWords.length;
    const recencyScore = Math.max(0, 1 - (currentYear - parseInt(paper.year || '2000')) / 20);
    const citationScore = Math.log10(Math.max(1, paper.citationCount)) / 5;
    const hasAbstract = paper.abstract && paper.abstract.length > 100 ? 0.2 : 0;
    const isOA = paper.fullTextStatus === 'open-access' ? 0.1 : 0;

    return {
      ...paper,
      relevanceScore: titleMatch * 0.4 + recencyScore * 0.2 + citationScore * 0.2 + hasAbstract + isOA,
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ─── Library Queue Builder ─────────────────────────────────────────────────────

function buildLibraryQueue(papers: EnrichedPaper[]): LibraryQueueItem[] {
  const paywalled = papers.filter(p => p.fullTextStatus === 'paywalled' || p.fullTextStatus === 'unknown');

  return paywalled.slice(0, 15).map((paper, idx): LibraryQueueItem => {
    let priority: 'critical' | 'important' | 'supplementary';
    let priorityReason: string;

    if (paper.citationCount >= 500 || idx < 3) {
      priority = 'critical';
      priorityReason = paper.citationCount >= 500
        ? `Cited ${paper.citationCount.toLocaleString()} times — foundational paper`
        : 'Top relevance match for your research topic';
    } else if (paper.citationCount >= 50 || idx < 8) {
      priority = 'important';
      priorityReason = paper.citationCount >= 50
        ? `Cited ${paper.citationCount.toLocaleString()} times — well-established study`
        : 'Highly relevant to your research question';
    } else {
      priority = 'supplementary';
      priorityReason = 'Supporting evidence — adds breadth to your review';
    }

    const encodedTitle = encodeURIComponent(paper.title);
    const doi = paper.doi || '';

    return {
      paper,
      priority,
      priorityReason,
      accessLinks: {
        doi: doi ? `https://doi.org/${doi}` : `https://scholar.google.com/scholar?q=${encodedTitle}`,
        semanticScholar: `https://www.semanticscholar.org/search?q=${encodedTitle}`,
        googleScholar: `https://scholar.google.com/scholar?q=${encodedTitle}`,
        researchGate: `https://www.researchgate.net/search?q=${encodedTitle}`,
        openAlexOa: paper.url ? `${paper.url}` : undefined,
      },
    };
  });
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, targetCount = 20 } = req.body as { topic?: string; targetCount?: number };

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'topic is required' });
  }

  const cleanTopic = topic.trim();
  const field = detectField(cleanTopic);
  const databases = getDatabasesForField(field);
  const limit = Math.min(Math.ceil(targetCount / 3), 15);

  // ── Query all applicable databases in parallel ──────────────────────────────
  const searchTasks: Promise<EnrichedPaper[]>[] = [];
  const dbLabels: string[] = [];

  if (databases.includes('semantic-scholar')) {
    searchTasks.push(searchSemanticScholar(cleanTopic, limit));
    dbLabels.push('Semantic Scholar');
  }
  if (databases.includes('openalex')) {
    searchTasks.push(searchOpenAlex(cleanTopic, limit));
    dbLabels.push('OpenAlex');
  }
  if (databases.includes('crossref')) {
    searchTasks.push(searchCrossref(cleanTopic, limit));
    dbLabels.push('CrossRef');
  }
  if (databases.includes('europepmc')) {
    searchTasks.push(searchEuropePMC(cleanTopic, limit));
    dbLabels.push('Europe PMC');
  }
  if (databases.includes('core')) {
    searchTasks.push(searchCORE(cleanTopic, limit));
    dbLabels.push('CORE');
  }
  if (databases.includes('eric')) {
    searchTasks.push(searchERIC(cleanTopic, limit));
    dbLabels.push('ERIC');
  }

  const results = await Promise.allSettled(searchTasks);
  let allPapers: EnrichedPaper[] = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') allPapers.push(...r.value);
  });

  // ── Deduplicate, enrich with Unpaywall, score ───────────────────────────────
  const deduplicated = deduplicatePapers(allPapers);
  const enriched = await enrichWithUnpaywall(deduplicated);
  const scored = scorePapers(enriched, cleanTopic).slice(0, targetCount);

  // ── Build summary stats ─────────────────────────────────────────────────────
  const openAccessCount = scored.filter(p => p.fullTextStatus === 'open-access').length;
  const paywalledCount = scored.filter(p => p.fullTextStatus === 'paywalled').length;
  const unknownCount = scored.filter(p => p.fullTextStatus === 'unknown').length;
  const coveragePercent = scored.length > 0
    ? Math.round((openAccessCount / scored.length) * 100)
    : 0;

  const libraryQueue = buildLibraryQueue(scored);

  const result: ResearchPipelineResult = {
    field,
    fieldLabel: FIELD_LABELS[field],
    databases: dbLabels,
    papers: scored,
    openAccessCount,
    paywalledCount,
    unknownCount,
    coveragePercent,
    libraryQueue,
    totalFound: allPapers.length,
  };

  return res.json(result);
}
