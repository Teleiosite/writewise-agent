import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, ExternalLink, FileText, CheckCircle2, Plus, Sparkles, 
  ArrowRight, BookOpen, Quote, Download, Globe, Award
} from "lucide-react";
import { toast } from "sonner";
import { 
  AcademicCitation, 
  searchCrossref, 
  searchOpenAlex, 
  searchArxiv, 
  resolveDoi, 
  getAuthorDisplayList 
} from "@/services/citationEngine";

interface CitationSearchProps {
  onCitationsFound: (citations: AcademicCitation[]) => void;
  onAddSingleCitation: (citation: AcademicCitation) => void;
}

export function CitationSearch({ onCitationsFound, onAddSingleCitation }: CitationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [doiInput, setDoiInput] = useState("");
  const [source, setSource] = useState<'all' | 'crossref' | 'openalex' | 'arxiv'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingDoi, setIsResolvingDoi] = useState(false);
  const [results, setResults] = useState<AcademicCitation[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Multi-source Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setResults([]);

    try {
      let combinedResults: AcademicCitation[] = [];

      if (source === 'crossref') {
        combinedResults = await searchCrossref(query, 12);
      } else if (source === 'openalex') {
        combinedResults = await searchOpenAlex(query, 12);
      } else if (source === 'semanticscholar') {
        const { searchSemanticScholar } = await import('@/services/citationEngine');
        combinedResults = await searchSemanticScholar(query, 12);
      } else if (source === 'pubmed') {
        const { searchEuropePMC } = await import('@/services/citationEngine');
        combinedResults = await searchEuropePMC(query, 12);
      } else if (source === 'arxiv') {
        combinedResults = await searchArxiv(query, 10);
      } else {
        // Search all indices concurrently
        const { searchSemanticScholar, searchEuropePMC } = await import('@/services/citationEngine');
        const [cr, oa, s2, pmc, ax] = await Promise.all([
          searchCrossref(query, 5),
          searchOpenAlex(query, 5),
          searchSemanticScholar(query, 5),
          searchEuropePMC(query, 4),
          searchArxiv(query, 3)
        ]);

        // Deduplicate by title similarity or DOI
        const seenDois = new Set<string>();
        const seenTitles = new Set<string>();

        [...cr, ...oa, ...s2, ...pmc, ...ax].forEach(item => {
          const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normDoi = item.doi?.toLowerCase();

          if (normDoi && seenDois.has(normDoi)) return;
          if (seenTitles.has(normTitle)) return;

          if (normDoi) seenDois.add(normDoi);
          seenTitles.add(normTitle);
          combinedResults.push(item);
        });
      }

      setResults(combinedResults);

      if (combinedResults.length === 0) {
        toast.error("No papers found. Try different keywords or search by DOI.");
      } else {
        toast.success(`Found ${combinedResults.length} verified academic papers`);
      }
    } catch (err: any) {
      toast.error(`Search error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Instant DOI Resolver
  const handleResolveDoi = async (e: React.FormEvent) => {
    e.preventDefault();
    const doi = doiInput.trim();
    if (!doi) return;

    setIsResolvingDoi(true);
    try {
      const citation = await resolveDoi(doi);
      if (citation) {
        setResults([citation, ...results]);
        onAddSingleCitation(citation);
        setAddedIds(prev => new Set([...prev, citation.id]));
        setDoiInput("");
        toast.success(`Resolved & added: "${citation.title.substring(0, 45)}..."`);
      } else {
        toast.error("Could not resolve DOI. Please verify the DOI string or URL.");
      }
    } catch (err: any) {
      toast.error(`DOI resolution failed: ${err.message}`);
    } finally {
      setIsResolvingDoi(false);
    }
  };

  const handleAdd = (citation: AcademicCitation) => {
    onAddSingleCitation(citation);
    setAddedIds(prev => new Set([...prev, citation.id]));
    toast.success(`Added "${citation.title.substring(0, 35)}..." to your workspace library`);
  };

  const handleAddAll = () => {
    results.forEach(c => onAddSingleCitation(c));
    setAddedIds(new Set(results.map(r => r.id)));
    toast.success(`Added all ${results.length} papers to your citation library!`);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search 350M+ papers across Crossref, OpenAlex, Semantic Scholar, PubMed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <Button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider px-5 border border-black dark:border-white shrink-0"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Database Index Filter */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span>Index:</span>
            {[
              { id: 'all', label: 'All Global (350M+)' },
              { id: 'crossref', label: 'Crossref (150M)' },
              { id: 'openalex', label: 'OpenAlex (250M)' },
              { id: 'semanticscholar', label: 'Semantic Scholar' },
              { id: 'pubmed', label: 'PubMed / Europe PMC' },
              { id: 'arxiv', label: 'arXiv Preprints' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSource(tab.id as any)}
                className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${
                  source === tab.id
                    ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {results.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAll}
              className="h-6 text-[10px] font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-800 px-2 shrink-0"
            >
              + Add All ({results.length})
            </Button>
          )}
        </div>
      </form>

      {/* Instant DOI Lookup Bar */}
      <form onSubmit={handleResolveDoi} className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
          <span>Quick DOI / URL Import:</span>
        </div>
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Paste DOI (e.g. 10.1038/s41586-020-2649-2) or URL..."
            value={doiInput}
            onChange={(e) => setDoiInput(e.target.value)}
            className="h-8 text-[11px] font-mono rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isResolvingDoi || !doiInput.trim()}
            variant="outline"
            className="h-8 rounded-none border-black dark:border-zinc-700 text-[10px] font-mono uppercase tracking-wider shrink-0"
          >
            {isResolvingDoi ? "Resolving..." : "Fetch DOI"}
          </Button>
        </div>
      </form>

      {/* Google Scholar & ResearchGate Bridge Tip */}
      <div className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between gap-2">
        <span>💡 <strong>Google Scholar &amp; ResearchGate Sync:</strong> Click "Cite" on Google Scholar/ResearchGate, copy the BibTeX/RIS, and paste it into the <strong>BibTeX &amp; RIS Sync</strong> tab above for instant 1-click import!</span>
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-3 pt-2 max-h-[480px] overflow-y-auto pr-1">
          {results.map((citation) => {
            const isAdded = addedIds.has(citation.id);
            const authorsDisplay = getAuthorDisplayList(citation.authors).slice(0, 3).join(', ') + (citation.authors.length > 3 ? ' et al.' : '');

            return (
              <div 
                key={citation.id}
                className="p-4 border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans space-y-2.5 transition-all hover:border-zinc-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="mono-badge text-[9px] uppercase tracking-wider mb-1.5 inline-block">
                      {citation.sourceDatabase || 'Verified Index'} · {citation.year}
                    </span>
                    <h4 className="text-sm font-bold text-black dark:text-white leading-snug">
                      {citation.title}
                    </h4>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAdd(citation)}
                    disabled={isAdded}
                    className={`shrink-0 rounded-none font-mono text-[10px] uppercase tracking-wider h-8 px-3 ${
                      isAdded
                        ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent'
                        : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border border-black dark:border-white'
                    }`}
                  >
                    {isAdded ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Library
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Citation
                      </span>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  <span>{authorsDisplay}</span>
                  {citation.source && (
                    <span className="italic ml-1">· {citation.source}</span>
                  )}
                </div>

                {/* Metadata tags: Citations, DOI, Open Access PDF */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                  {typeof citation.citationCount === 'number' && citation.citationCount > 0 && (
                    <span className="px-1.5 py-0.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      {citation.citationCount.toLocaleString()} citations
                    </span>
                  )}

                  {citation.doi && (
                    <a
                      href={`https://doi.org/${citation.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      doi:{citation.doi} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}

                  {citation.pdfUrl && (
                    <a
                      href={citation.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Open-Access PDF
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
