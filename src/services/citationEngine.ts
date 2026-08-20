/**
 * WriteWise World-Class Academic Citation & Reference Engine
 * 
 * Powered by 100% free, open-access academic indices:
 * - Crossref REST API (150M+ DOIs & publisher metadata)
 * - OpenAlex API (250M+ scientific works, citation counts, open-access PDF URLs)
 * - arXiv API (2.4M+ preprints across STEM, AI & Quantitative sciences)
 * - DOI Content Negotiation (Direct publisher CSL-JSON)
 * 
 * Formats: APA 7th, MLA 9th, Chicago 17th, Harvard, IEEE, Vancouver, Nature
 * Supports: BibTeX (.bib), RIS (.ris), CSL-JSON, In-Text Parenthetical & Narrative citations
 */

export type AcademicWorkType = 'journal' | 'book' | 'chapter' | 'conference' | 'thesis' | 'preprint' | 'website';

export interface Author {
  given?: string;
  family?: string;
  name?: string; // full name fallback
}

export interface AcademicCitation {
  id: string;
  title: string;
  authors: Author[];
  year: string;
  month?: string;
  source: string; // Journal / Book Title / Publisher / University
  volume?: string;
  issue?: string;
  pages?: string;
  type: AcademicWorkType;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
  citationCount?: number;
  publisher?: string;
  isbn?: string;
  issn?: string;
  sourceDatabase?: 'Crossref' | 'OpenAlex' | 'arXiv' | 'DOI' | 'BibTeX' | 'RIS' | 'Manual';
}

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'Vancouver' | 'Nature';

export type InTextStyle = 'parenthetical' | 'narrative' | 'numbered';

// ─── Helper: Format Author Names ─────────────────────────────────────────────

export function getAuthorDisplayList(authors: Author[]): string[] {
  if (!authors || authors.length === 0) return ['Anonymous'];
  return authors.map(a => {
    if (a.family && a.given) {
      const initials = a.given.split(/[\s-]+/).map(n => n.charAt(0) ? `${n.charAt(0)}.` : '').join(' ');
      return `${a.family}, ${initials}`.trim();
    }
    return a.name || a.family || a.given || 'Unknown Author';
  });
}

export function getAuthorLastNames(authors: Author[]): string[] {
  if (!authors || authors.length === 0) return ['Anonymous'];
  return authors.map(a => {
    if (a.family) return a.family;
    if (a.name) {
      const parts = a.name.trim().split(/\s+/);
      return parts[parts.length - 1];
    }
    return a.given || 'Unknown';
  });
}

// ─── IN-TEXT CITATIONS ───────────────────────────────────────────────────────

export function formatInTextCitation(
  citation: AcademicCitation, 
  style: CitationStyle = 'APA', 
  mode: InTextStyle = 'parenthetical',
  pageNumber?: string
): string {
  const lastNames = getAuthorLastNames(citation.authors);
  const year = citation.year || 'n.d.';
  const pageStr = pageNumber ? `, p. ${pageNumber}` : '';

  // Numbered styles (IEEE, Vancouver, Nature)
  if (style === 'IEEE') {
    return pageNumber ? `[1, p. ${pageNumber}]` : `[1]`;
  }
  if (style === 'Vancouver' || style === 'Nature') {
    return pageNumber ? `(1, p. ${pageNumber})` : `(1)`;
  }

  // Author-Date styles (APA 7th, Harvard, Chicago, MLA)
  let authorStr = '';
  if (lastNames.length === 1) {
    authorStr = lastNames[0];
  } else if (lastNames.length === 2) {
    if (style === 'APA' && mode === 'parenthetical') {
      authorStr = `${lastNames[0]} & ${lastNames[1]}`;
    } else if (style === 'MLA') {
      authorStr = `${lastNames[0]} and ${lastNames[1]}`;
    } else {
      authorStr = `${lastNames[0]} and ${lastNames[1]}`;
    }
  } else {
    // 3 or more authors: APA 7th, Harvard, Chicago use "et al."
    authorStr = `${lastNames[0]} et al.`;
  }

  if (style === 'MLA') {
    // MLA uses Author Page (Smith 42) without comma or year
    const mlaLoc = pageNumber ? ` ${pageNumber}` : '';
    return mode === 'parenthetical' ? `(${authorStr}${mlaLoc})` : `${authorStr} (${year}${pageStr})`;
  }

  if (mode === 'narrative') {
    return `${authorStr} (${year}${pageStr})`;
  }

  // Default parenthetical
  return `(${authorStr}, ${year}${pageStr})`;
}

// ─── FULL BIBLIOGRAPHY / REFERENCE LIST FORMATTER ────────────────────────────

export function formatReference(citation: AcademicCitation, style: CitationStyle = 'APA'): string {
  const authors = citation.authors || [];
  const year = citation.year || 'n.d.';
  const title = citation.title?.trim().replace(/\.$/, '') || 'Untitled document';
  const source = citation.source?.trim() || '';
  const vol = citation.volume ? ` ${citation.volume}` : '';
  const issue = citation.issue ? `(${citation.issue})` : '';
  const pages = citation.pages ? `, ${citation.pages}` : '';
  const doiUrl = citation.doi ? `https://doi.org/${citation.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';
  const fallbackUrl = citation.url || doiUrl;

  switch (style) {
    case 'APA': {
      // APA 7th Edition
      let authorList = '';
      if (authors.length === 0) {
        authorList = 'Anonymous.';
      } else if (authors.length === 1) {
        authorList = `${getAuthorDisplayList(authors)[0]}.`;
      } else if (authors.length === 2) {
        const list = getAuthorDisplayList(authors);
        authorList = `${list[0]}, & ${list[1]}.`;
      } else if (authors.length <= 20) {
        const list = getAuthorDisplayList(authors);
        const last = list.pop();
        authorList = `${list.join(', ')}, & ${last}.`;
      } else {
        const list = getAuthorDisplayList(authors.slice(0, 19));
        const last = getAuthorDisplayList([authors[authors.length - 1]])[0];
        authorList = `${list.join(', ')}, ... ${last}.`;
      }

      let sourceBlock = source;
      if (citation.type === 'journal') {
        sourceBlock = `${source}${vol}${issue}${pages}.`;
      } else if (citation.type === 'book') {
        sourceBlock = citation.publisher ? `${citation.publisher}.` : `${source}.`;
      } else {
        sourceBlock = `${source}.`;
      }

      return `${authorList} (${year}). ${title}. ${sourceBlock}${doiUrl ? ` ${doiUrl}` : ''}`.trim();
    }

    case 'MLA': {
      // MLA 9th Edition
      let authorList = '';
      if (authors.length === 1) {
        authorList = `${getAuthorDisplayList(authors)[0]}.`;
      } else if (authors.length === 2) {
        const a1 = getAuthorDisplayList([authors[0]])[0];
        const a2 = authors[1].name || `${authors[1].given} ${authors[1].family}`;
        authorList = `${a1}, and ${a2}.`;
      } else if (authors.length >= 3) {
        authorList = `${getAuthorDisplayList([authors[0]])[0]}, et al.`;
      } else {
        authorList = 'Anonymous.';
      }

      const container = source ? ` ${source},` : '';
      const volInfo = citation.volume ? ` vol. ${citation.volume},` : '';
      const noInfo = citation.issue ? ` no. ${citation.issue},` : '';
      const pageInfo = citation.pages ? ` pp. ${citation.pages},` : '';

      return `${authorList} "${title}."${container}${volInfo}${noInfo} ${year}${pageInfo}.${doiUrl ? ` ${doiUrl}` : ''}`.trim();
    }

    case 'Chicago': {
      // Chicago 17th Author-Date
      const authorList = getAuthorDisplayList(authors).join(', ');
      return `${authorList}. ${year}. "${title}." ${source}${vol ? ` ${vol}` : ''}${issue ? `, no. ${citation.issue}` : ''}${pages ? `: ${citation.pages}` : ''}.${doiUrl ? ` ${doiUrl}` : ''}`.trim();
    }

    case 'Harvard': {
      // Harvard Standard (UK/Commonwealth)
      const list = getAuthorDisplayList(authors);
      let authorList = '';
      if (list.length === 1) authorList = list[0];
      else if (list.length === 2) authorList = `${list[0]} and ${list[1]}`;
      else authorList = `${list[0]} et al.`;

      return `${authorList} (${year}) '${title}', ${source}${vol ? `, ${vol}` : ''}${issue ? `(${citation.issue})` : ''}${pages ? `, pp. ${citation.pages}` : ''}.${doiUrl ? ` Available at: ${doiUrl}` : ''}`.trim();
    }

    case 'IEEE': {
      // IEEE Standard
      const authorList = authors.map(a => {
        const init = a.given ? `${a.given.charAt(0)}. ` : '';
        return `${init}${a.family || a.name || ''}`;
      }).join(', ');

      return `${authorList}, "${title}," ${source}${vol ? `, vol. ${vol}` : ''}${issue ? `, no. ${citation.issue}` : ''}${pages ? `, pp. ${citation.pages}` : ''}, ${year}.${doiUrl ? ` doi: ${citation.doi}` : ''}`.trim();
    }

    case 'Vancouver': {
      // Vancouver Medical
      const authorList = authors.slice(0, 6).map(a => `${a.family || ''} ${a.given ? a.given.charAt(0) : ''}`.trim()).join(', ') + (authors.length > 6 ? ', et al.' : '');
      return `${authorList}. ${title}. ${source}. ${year}${vol ? `;${vol}` : ''}${issue ? `(${citation.issue})` : ''}${pages ? `:${citation.pages}` : ''}.${doiUrl ? ` doi: ${citation.doi}` : ''}`.trim();
    }

    case 'Nature': {
      // Nature Style
      const authorList = authors.slice(0, 5).map(a => `${a.family}, ${a.given ? a.given.charAt(0) + '.' : ''}`).join(', ') + (authors.length > 5 ? ' et al.' : '');
      return `${authorList} ${title}. ${source} ${vol ? `**${vol}**` : ''}${pages ? `, ${pages}` : ''} (${year}).${doiUrl ? ` https://doi.org/${citation.doi}` : ''}`.trim();
    }

    default:
      return `${getAuthorDisplayList(authors).join(', ')} (${year}). ${title}. ${source}.`;
  }
}

// ─── GENERATE FULL ALPHABETICAL BIBLIOGRAPHY ─────────────────────────────────

export function generateCompleteBibliography(citations: AcademicCitation[], style: CitationStyle = 'APA'): string {
  if (!citations || citations.length === 0) return '';

  if (style === 'IEEE' || style === 'Vancouver') {
    // Numbered styles keep order of appearance
    return citations.map((c, i) => `[${i + 1}] ${formatReference(c, style)}`).join('\n\n');
  }

  // Author-Date styles sort alphabetically by first author's family name
  const sorted = [...citations].sort((a, b) => {
    const nameA = (a.authors?.[0]?.family || a.authors?.[0]?.name || a.title || '').toLowerCase();
    const nameB = (b.authors?.[0]?.family || b.authors?.[0]?.name || b.title || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return sorted.map(c => formatReference(c, style)).join('\n\n');
}

// ─── OPEN SCIENTIFIC SEARCH ENGINES ──────────────────────────────────────────

/**
 * 1. Search Crossref REST API (150M+ DOIs)
 * Free public API with comprehensive journal metadata.
 */
export async function searchCrossref(query: string, rows: number = 10, page: number = 1): Promise<AcademicCitation[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const offset = Math.max(0, (page - 1) * rows);
    const url = `https://api.crossref.org/works?query=${encoded}&rows=${rows}&offset=${offset}&sort=relevance`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WriteWise-Academic-Workspace/1.0 (mailto:academic-support@writewise.app)'
      }
    });

    if (!res.ok) throw new Error(`Crossref API error: ${res.status}`);

    const data = await res.json();
    const items = data.message?.items || [];

    return items.map((item: any) => {
      const authors: Author[] = (item.author || []).map((a: any) => ({
        given: a.given || '',
        family: a.family || '',
        name: a.name || `${a.given || ''} ${a.family || ''}`.trim()
      }));

      // Year extraction
      const issued = item.issued?.['date-parts']?.[0] || item.published?.['date-parts']?.[0] || item.created?.['date-parts']?.[0];
      const year = issued?.[0] ? String(issued[0]) : '';
      const month = issued?.[1] ? String(issued[1]) : '';

      const title = Array.isArray(item.title) ? item.title[0] : (item.title || 'Untitled');
      const source = Array.isArray(item['container-title']) ? item['container-title'][0] : (item['container-title'] || item.publisher || 'Crossref Publication');

      return {
        id: `crossref-${item.DOI || Math.random().toString(36).substring(2, 9)}`,
        title: title.replace(/<\/?[^>]+(>|$)/g, ''), // strip any HTML
        authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
        year: year || String(new Date().getFullYear()),
        month,
        source,
        volume: item.volume || undefined,
        issue: item.issue || undefined,
        pages: item.page || undefined,
        type: item.type === 'book' ? 'book' : item.type === 'proceedings-article' ? 'conference' : 'journal',
        doi: item.DOI,
        url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
        publisher: item.publisher,
        issn: item.ISSN?.[0],
        isbn: item.ISBN?.[0],
        citationCount: item['is-referenced-by-count'] || 0,
        sourceDatabase: 'Crossref' as const
      };
    });
  } catch (err) {
    console.error('Crossref search error:', err);
    return [];
  }
}

/**
 * 2. Search OpenAlex API (250M+ Works with open-access PDF links)
 * Free, blazing fast, public scholarly index.
 */
export async function searchOpenAlex(query: string, perPage: number = 10, page: number = 1): Promise<AcademicCitation[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://api.openalex.org/works?search=${encoded}&page=${page}&per-page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WriteWise-Academic-Workspace/1.0 (mailto:academic-support@writewise.app)'
      }
    });

    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);

    const data = await res.json();
    const results = data.results || [];

    return results.map((work: any) => {
      const authors: Author[] = (work.authorships || []).map((a: any) => ({
        name: a.author?.display_name || 'Unknown Author',
        family: a.author?.display_name?.split(' ').pop() || '',
        given: a.author?.display_name?.split(' ').slice(0, -1).join(' ') || ''
      }));

      const year = work.publication_year ? String(work.publication_year) : '';
      const title = work.title || 'Untitled Work';
      const source = work.primary_location?.source?.display_name || work.host_venue?.name || 'Academic Venue';

      return {
        id: `openalex-${work.id?.replace('https://openalex.org/', '') || Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
        year: year || String(new Date().getFullYear()),
        source,
        volume: work.biblio?.volume || undefined,
        issue: work.biblio?.issue || undefined,
        pages: work.biblio?.first_page ? `${work.biblio.first_page}-${work.biblio.last_page || ''}` : undefined,
        type: work.type === 'book' ? 'book' : 'journal',
        doi: work.doi ? work.doi.replace('https://doi.org/', '') : undefined,
        url: work.doi || work.primary_location?.landing_page_url,
        pdfUrl: work.open_access?.oa_url || work.primary_location?.pdf_url,
        citationCount: work.cited_by_count || 0,
        sourceDatabase: 'OpenAlex' as const
      };
    });
  } catch (err) {
    console.error('OpenAlex search error:', err);
    return [];
  }
}

/**
 * 3. Search arXiv API (2.4M+ Preprints in AI, CS, Math, Quant Finance)
 */
export async function searchArxiv(query: string, maxResults: number = 8, page: number = 1): Promise<AcademicCitation[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const start = Math.max(0, (page - 1) * maxResults);
    const url = `https://export.arxiv.org/api/query?search_query=all:${encoded}&start=${start}&max_results=${maxResults}&sortBy=relevance`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

    const xmlText = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');

    const citations: AcademicCitation[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0]?.textContent?.replace(/\s+/g, ' ').trim() || 'Untitled arXiv Paper';
      const published = entry.getElementsByTagName('published')[0]?.textContent || '';
      const year = published ? published.substring(0, 4) : String(new Date().getFullYear());
      const summary = entry.getElementsByTagName('summary')[0]?.textContent?.replace(/\s+/g, ' ').trim();
      const arxivId = entry.getElementsByTagName('id')[0]?.textContent || '';
      const pdfLink = Array.from(entry.getElementsByTagName('link')).find(l => l.getAttribute('title') === 'pdf')?.getAttribute('href');

      const authorNodes = entry.getElementsByTagName('author');
      const authors: Author[] = [];
      for (let j = 0; j < authorNodes.length; j++) {
        const name = authorNodes[j].getElementsByTagName('name')[0]?.textContent?.trim();
        if (name) {
          const parts = name.split(' ');
          authors.push({
            name,
            family: parts[parts.length - 1],
            given: parts.slice(0, -1).join(' ')
          });
        }
      }

      citations.push({
        id: `arxiv-${arxivId.split('/').pop() || Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
        year,
        source: 'arXiv Preprint Server',
        type: 'preprint',
        url: arxivId,
        pdfUrl: pdfLink || `${arxivId.replace('abs', 'pdf')}.pdf`,
        abstract: summary,
        sourceDatabase: 'arXiv'
      });
    }

    return citations;
  } catch (err) {
    console.error('arXiv search error:', err);
    return [];
  }
}

/**
 * 4. Search Semantic Scholar Graph API (210M+ papers with TLDR & citation counts)
 */
export async function searchSemanticScholar(query: string, limit: number = 8, page: number = 1): Promise<AcademicCitation[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const offset = Math.max(0, (page - 1) * limit);
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encoded}&offset=${offset}&limit=${limit}&fields=title,authors,year,venue,publicationVenue,openAccessPdf,citationCount,externalIds,abstract`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Semantic Scholar API error: ${res.status}`);

    const data = await res.json();
    const papers = data.data || [];

    return papers.map((p: any) => {
      const authors: Author[] = (p.authors || []).map((a: any) => {
        const parts = (a.name || '').trim().split(' ');
        return {
          name: a.name,
          family: parts[parts.length - 1] || '',
          given: parts.slice(0, -1).join(' ') || ''
        };
      });

      return {
        id: `s2-${p.paperId || Math.random().toString(36).substring(2, 9)}`,
        title: p.title || 'Untitled Paper',
        authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
        year: p.year ? String(p.year) : String(new Date().getFullYear()),
        source: p.publicationVenue?.name || p.venue || 'Academic Journal',
        type: 'journal' as const,
        doi: p.externalIds?.DOI || undefined,
        url: p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : (p.externalIds?.ArXiv ? `https://arxiv.org/abs/${p.externalIds.ArXiv}` : undefined),
        pdfUrl: p.openAccessPdf?.url || undefined,
        abstract: p.abstract || undefined,
        citationCount: p.citationCount || 0,
        sourceDatabase: 'OpenAlex' as const
      };
    });
  } catch (err) {
    console.error('Semantic Scholar search error:', err);
    return [];
  }
}

/**
 * 5. Search Europe PMC API (44M+ PubMed & life sciences literature)
 */
export async function searchEuropePMC(query: string, pageSize: number = 8, page: number = 1): Promise<AcademicCitation[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encoded}&format=json&page=${page}&pageSize=${pageSize}&resultType=core`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Europe PMC error: ${res.status}`);

    const data = await res.json();
    const list = data.resultList?.result || [];

    return list.map((item: any) => {
      const authorStr = item.authorString || '';
      const authors: Author[] = authorStr.split(',').map((name: string) => {
        const trimmed = name.trim();
        const parts = trimmed.split(' ');
        return {
          name: trimmed,
          family: parts[0] || '',
          given: parts.slice(1).join(' ') || ''
        };
      });

      return {
        id: `epmc-${item.id || Math.random().toString(36).substring(2, 9)}`,
        title: item.title?.replace(/\.$/, '') || 'Untitled Medical Paper',
        authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
        year: item.pubYear ? String(item.pubYear) : String(new Date().getFullYear()),
        source: item.journalTitle || item.bookTitle || 'Biomedical Literature',
        volume: item.journalVolume || undefined,
        issue: item.issue || undefined,
        pages: item.pageInfo || undefined,
        type: item.pubType === 'book' ? 'book' : 'journal',
        doi: item.doi || undefined,
        url: item.doi ? `https://doi.org/${item.doi}` : (item.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}` : undefined),
        citationCount: item.citedByCount || 0,
        sourceDatabase: 'Crossref' as const
      };
    });
  } catch (err) {
    console.error('Europe PMC search error:', err);
    return [];
  }
}

/**
 * 4. Resolve DOI directly via doi.org Content Negotiation
 * Accepts any DOI e.g. "10.1038/s41586-020-2649-2" or URL
 */
export async function resolveDoi(doiOrUrl: string): Promise<AcademicCitation | null> {
  const cleanDoi = doiOrUrl.trim()
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:\s*/i, '');

  if (!cleanDoi) return null;

  try {
    const url = `https://doi.org/${cleanDoi}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.citationstyles.csl+json'
      }
    });

    if (!res.ok) {
      // Fallback: search Crossref directly for this DOI
      const crossrefRes = await searchCrossref(cleanDoi, 1);
      return crossrefRes[0] || null;
    }

    const csl = await res.json();
    const authors: Author[] = (csl.author || []).map((a: any) => ({
      given: a.given || '',
      family: a.family || '',
      name: a.literal || `${a.given || ''} ${a.family || ''}`.trim()
    }));

    const issued = csl.issued?.['date-parts']?.[0];
    const year = issued?.[0] ? String(issued[0]) : (csl.created?.['date-parts']?.[0]?.[0] ? String(csl.created['date-parts'][0][0]) : '');

    return {
      id: `doi-${cleanDoi.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: csl.title || 'Untitled Publication',
      authors: authors.length > 0 ? authors : [{ name: 'Anonymous' }],
      year: year || String(new Date().getFullYear()),
      source: csl['container-title'] || csl.publisher || 'Academic Publication',
      volume: csl.volume ? String(csl.volume) : undefined,
      issue: csl.issue ? String(csl.issue) : undefined,
      pages: csl.page ? String(csl.page) : undefined,
      type: csl.type === 'book' ? 'book' : 'journal',
      doi: cleanDoi,
      url: `https://doi.org/${cleanDoi}`,
      publisher: csl.publisher,
      issn: csl.ISSN,
      isbn: csl.ISBN,
      sourceDatabase: 'DOI'
    };
  } catch (err) {
    console.error('DOI resolve error:', err);
    return null;
  }
}

// ─── BIBTEX PARSER & EXPORTER ────────────────────────────────────────────────

export function exportToBibTeX(citations: AcademicCitation[]): string {
  return citations.map(c => {
    const key = `${(c.authors?.[0]?.family || 'citation').toLowerCase()}${c.year || 'year'}_${c.id.substring(0, 4)}`;
    const authorStr = c.authors.map(a => {
      if (a.family && a.given) return `${a.family}, ${a.given}`;
      return a.name || a.family || a.given;
    }).join(' and ');

    const entryType = c.type === 'book' ? 'book' : c.type === 'conference' ? 'inproceedings' : c.type === 'preprint' ? 'misc' : 'article';

    const fields: string[] = [
      `  title = {${c.title}}`,
      `  author = {${authorStr}}`,
      `  year = {${c.year}}`,
    ];

    if (c.source) {
      if (c.type === 'book') fields.push(`  publisher = {${c.source}}`);
      else if (c.type === 'conference') fields.push(`  booktitle = {${c.source}}`);
      else fields.push(`  journal = {${c.source}}`);
    }

    if (c.volume) fields.push(`  volume = {${c.volume}}`);
    if (c.issue) fields.push(`  number = {${c.issue}}`);
    if (c.pages) fields.push(`  pages = {${c.pages}}`);
    if (c.doi) fields.push(`  doi = {${c.doi}}`);
    if (c.url) fields.push(`  url = {${c.url}}`);

    return `@${entryType}{${key},\n${fields.join(',\n')}\n}`;
  }).join('\n\n');
}

export function parseBibTeX(bibtexText: string): AcademicCitation[] {
  const entries: AcademicCitation[] = [];
  const entryRegex = /@(\w+)\s*\{\s*([^,]+),([^@]*)/g;
  let match;

  while ((match = entryRegex.exec(bibtexText)) !== null) {
    const rawType = match[1].toLowerCase();
    const id = match[2].trim();
    const body = match[3];

    const getField = (name: string): string => {
      const fieldRegex = new RegExp(`${name}\\s*=\\s*[{"]([^}"]+)[}"]|${name}\\s*=\\s*([0-9]+)`, 'i');
      const m = body.match(fieldRegex);
      return (m ? (m[1] || m[2]) : '').trim();
    };

    const title = getField('title');
    const authorRaw = getField('author');
    const year = getField('year');
    const journal = getField('journal') || getField('booktitle') || getField('publisher');
    const volume = getField('volume');
    const number = getField('number') || getField('issue');
    const pages = getField('pages');
    const doi = getField('doi');
    const url = getField('url');

    if (title) {
      const authors: Author[] = authorRaw.split(/\s+and\s+/i).map(part => {
        if (part.includes(',')) {
          const [fam, giv] = part.split(',');
          return { family: fam.trim(), given: giv.trim() };
        }
        const words = part.trim().split(' ');
        return {
          name: part.trim(),
          family: words[words.length - 1],
          given: words.slice(0, -1).join(' ')
        };
      });

      entries.push({
        id: `bib-${id || Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : [{ name: 'Unknown Author' }],
        year: year || String(new Date().getFullYear()),
        source: journal || 'Academic Source',
        volume: volume || undefined,
        issue: number || undefined,
        pages: pages || undefined,
        type: rawType === 'book' ? 'book' : rawType === 'inproceedings' ? 'conference' : 'journal',
        doi: doi || undefined,
        url: url || undefined,
        sourceDatabase: 'BibTeX'
      });
    }
  }

  return entries;
}

// ─── RIS PARSER & EXPORTER (Zotero / Mendeley / EndNote) ──────────────────────

export function exportToRIS(citations: AcademicCitation[]): string {
  return citations.map(c => {
    const risType = c.type === 'book' ? 'BOOK' : c.type === 'conference' ? 'CONF' : 'JOUR';
    const lines = [
      `TY  - ${risType}`,
      `TI  - ${c.title}`,
      ...c.authors.map(a => `AU  - ${a.family ? `${a.family}, ${a.given || ''}` : a.name}`),
      `PY  - ${c.year}`,
      c.source ? `JO  - ${c.source}` : '',
      c.volume ? `VL  - ${c.volume}` : '',
      c.issue ? `IS  - ${c.issue}` : '',
      c.pages ? `SP  - ${c.pages.split('-')[0]}` : '',
      c.pages && c.pages.includes('-') ? `EP  - ${c.pages.split('-')[1]}` : '',
      c.doi ? `DO  - ${c.doi}` : '',
      c.url ? `UR  - ${c.url}` : '',
      `ER  - `
    ].filter(Boolean);

    return lines.join('\r\n');
  }).join('\r\n\r\n');
}

export function parseRIS(risText: string): AcademicCitation[] {
  const entries: AcademicCitation[] = [];
  const recordBlocks = risText.split(/ER\s{0,2}-\s{0,2}/g);

  for (const block of recordBlocks) {
    if (!block.trim()) continue;

    const lines = block.split(/\r?\n/);
    let title = '';
    const authors: Author[] = [];
    let year = '';
    let journal = '';
    let volume = '';
    let issue = '';
    let startPage = '';
    let endPage = '';
    let doi = '';
    let url = '';

    for (const line of lines) {
      const tag = line.substring(0, 2).trim().toUpperCase();
      const value = line.substring(6).trim();

      if (!value) continue;

      if (tag === 'TI' || tag === 'T1') title = value;
      else if (tag === 'AU' || tag === 'A1') {
        const parts = value.split(',');
        authors.push({
          family: parts[0]?.trim(),
          given: parts[1]?.trim(),
          name: value
        });
      }
      else if (tag === 'PY' || tag === 'Y1') year = value.substring(0, 4);
      else if (tag === 'JO' || tag === 'JF' || tag === 'T2') journal = value;
      else if (tag === 'VL') volume = value;
      else if (tag === 'IS') issue = value;
      else if (tag === 'SP') startPage = value;
      else if (tag === 'EP') endPage = value;
      else if (tag === 'DO') doi = value;
      else if (tag === 'UR') url = value;
    }

    if (title) {
      const pages = startPage && endPage ? `${startPage}-${endPage}` : startPage || undefined;
      entries.push({
        id: `ris-${Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : [{ name: 'Unknown Author' }],
        year: year || String(new Date().getFullYear()),
        source: journal || 'Academic Publication',
        volume: volume || undefined,
        issue: issue || undefined,
        pages,
        type: 'journal',
        doi: doi || undefined,
        url: url || undefined,
        sourceDatabase: 'RIS'
      });
    }
  }

  return entries;
}
