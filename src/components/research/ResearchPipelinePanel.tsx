import React, { useState, useCallback } from 'react';
import {
  Search, Loader2, BookOpen, Database, FlaskConical,
  Layers, FileText, Sparkles, ChevronRight, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import {
  searchLiterature,
  fetchFullTexts,
  synthesiseLiterature,
  calculateCoverage,
  type EnrichedPaper,
  type LibraryQueueItem,
  type ResearchPipelineResult,
  type SynthesisResult,
} from '@/services/researchPipelineService';
import { UNIVERSITIES, getUniversitiesByRegion } from '@/services/universityResolver';
import { CoverageIndicator } from './CoverageIndicator';
import { LibraryQueuePanel } from './LibraryQueuePanel';

interface ResearchPipelinePanelProps {
  onInsertToEditor?: (markdown: string) => void;
  className?: string;
}

type PipelineStage = 'idle' | 'searching' | 'fetching' | 'ready' | 'synthesising' | 'done';

export function ResearchPipelinePanel({ onInsertToEditor, className = '' }: ResearchPipelinePanelProps) {
  const [topic, setTopic] = useState('');
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('search');

  const [result, setResult] = useState<ResearchPipelineResult | null>(null);
  const [papers, setPapers] = useState<EnrichedPaper[]>([]);
  const [libraryQueue, setLibraryQueue] = useState<LibraryQueueItem[]>([]);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [uploadedPapers, setUploadedPapers] = useState<{ text: string; fileName: string }[]>([]);

  const [userUniversity, setUserUniversity] = useState<string>(
    () => localStorage.getItem('writewise_university') || ''
  );
  const [reviewStyle, setReviewStyle] = useState<'annotated' | 'empirical' | 'narrative'>('annotated');

  // ── Step 1: Search ───────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Please enter a research topic');
      return;
    }

    setStage('searching');
    setSynthesis(null);
    setUploadedPapers([]);

    try {
      const searchResult = await searchLiterature(topic.trim(), 25);
      setResult(searchResult);
      setPapers(searchResult.papers);

      // Build library queue with uploaded=false
      const queue: LibraryQueueItem[] = searchResult.libraryQueue.map(q => ({
        ...q,
        uploaded: false,
      }));
      setLibraryQueue(queue);

      toast.success(
        `Found ${searchResult.totalFound} papers across ${searchResult.databases.length} databases`,
        { description: `Field detected: ${searchResult.fieldLabel}` }
      );

      // ── Step 2: Auto-fetch open-access full texts ──────────────────────────
      setStage('fetching');
      setFetchProgress({ done: 0, total: searchResult.papers.filter(p => p.pdfUrl).length });

      const enriched = await fetchFullTexts(searchResult.papers, (done, total) => {
        setFetchProgress({ done, total });
      });

      setPapers(enriched);
      setStage('ready');
      setActiveTab('results');

      const fullTextCount = enriched.filter(p => p.fullText).length;
      if (fullTextCount > 0) {
        toast.success(`Retrieved full text for ${fullTextCount} open-access papers`);
      }
    } catch (err) {
      toast.error('Search failed', { description: (err as Error).message });
      setStage('idle');
    }
  }, [topic]);

  // ── Library Queue upload ──────────────────────────────────────────────────────
  const handleQueueUpload = useCallback((item: LibraryQueueItem, text: string, fileName: string) => {
    setLibraryQueue(q =>
      q.map(qi => qi.paper.id === item.paper.id ? { ...qi, uploaded: true } : qi)
    );
    setUploadedPapers(prev => [...prev, { text, fileName }]);
    toast.success(`"${fileName}" added to your review`);
  }, []);

  // ── Step 3: Synthesise ────────────────────────────────────────────────────────
  const handleSynthesise = useCallback(async () => {
    if (!papers.length) {
      toast.error('No papers to synthesise');
      return;
    }
    setStage('synthesising');

    try {
      const syn = await synthesiseLiterature(topic, papers, uploadedPapers, reviewStyle);
      setSynthesis(syn);
      setStage('done');
      setActiveTab('review');
      toast.success('Literature review generated!');
    } catch (err) {
      toast.error('Synthesis failed', { description: (err as Error).message });
      setStage('ready');
    }
  }, [papers, topic, uploadedPapers, reviewStyle]);

  // ── University save ───────────────────────────────────────────────────────────
  const handleUniversityChange = (value: string) => {
    setUserUniversity(value);
    localStorage.setItem('writewise_university', value);
  };

  const coverage = result ? calculateCoverage(papers, libraryQueue) : null;

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Research Pipeline</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Multi-database search · Full-text extraction · AI synthesis
          </p>
        </div>
      </div>

      {/* Topic search bar */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your research topic, variable, or hypothesis..."
            className="flex-1 text-sm"
            disabled={stage === 'searching' || stage === 'fetching' || stage === 'synthesising'}
          />
          <Button
            onClick={handleSearch}
            disabled={stage === 'searching' || stage === 'fetching' || stage === 'synthesising' || !topic.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            {stage === 'searching' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </Button>
        </div>

        {/* Status messages */}
        {stage === 'searching' && (
          <StatusBar icon={<Loader2 className="w-3.5 h-3.5 animate-spin" />} text="Searching across multiple academic databases..." />
        )}
        {stage === 'fetching' && (
          <StatusBar
            icon={<Loader2 className="w-3.5 h-3.5 animate-spin" />}
            text={`Extracting full text from open-access papers… ${fetchProgress.done}/${fetchProgress.total}`}
          />
        )}
        {stage === 'synthesising' && (
          <StatusBar icon={<Loader2 className="w-3.5 h-3.5 animate-spin" />} text="AI is synthesising your literature review…" />
        )}

        {/* Field + databases detected */}
        {result && stage !== 'searching' && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <FlaskConical className="w-3 h-3" />
              {result.fieldLabel}
            </Badge>
            {result.databases.slice(0, 4).map(db => (
              <Badge key={db} variant="secondary" className="text-xs">{db}</Badge>
            ))}
            {result.databases.length > 4 && (
              <Badge variant="secondary" className="text-xs">+{result.databases.length - 4} more</Badge>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      {result && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-3 mb-0 w-fit">
            <TabsTrigger value="results" className="text-xs gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Results <Badge variant="secondary" className="text-xs ml-1">{papers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="queue" className="text-xs gap-1">
              <Layers className="w-3.5 h-3.5" />
              Library Queue <Badge variant="secondary" className="text-xs ml-1">{libraryQueue.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="review" className="text-xs gap-1" disabled={!synthesis}>
              <FileText className="w-3.5 h-3.5" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Results tab */}
          <TabsContent value="results" className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-4">
            {coverage && <CoverageIndicator stats={coverage} />}

            {/* Papers list */}
            <div className="space-y-2">
              {papers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* Generate button */}
            <div className="pt-2 space-y-2">
              <div className="flex gap-2">
                {(['annotated', 'empirical', 'narrative'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setReviewStyle(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                      reviewStyle === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {s === 'annotated' ? 'Annotated Bibliography' : s === 'empirical' ? 'Empirical Matrix' : 'Narrative Review'}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSynthesise}
                disabled={stage === 'synthesising'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {stage === 'synthesising' ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Literature Review</>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Library Queue tab */}
          <TabsContent value="queue" className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-4">
            {/* University selector */}
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
              <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Your university (enables direct library links)
              </label>
              <select
                value={userUniversity}
                onChange={e => handleUniversityChange(e.target.value)}
                className="w-full text-sm border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
              >
                <option value="">Select your university…</option>
                {Object.entries(getUniversitiesByRegion()).map(([region, unis]) => (
                  <optgroup key={region} label={region}>
                    {unis.map(u => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {coverage && <CoverageIndicator stats={coverage} />}

            <LibraryQueuePanel
              items={libraryQueue}
              userUniversity={userUniversity || undefined}
              onUpload={handleQueueUpload}
            />

            <Button
              onClick={handleSynthesise}
              disabled={stage === 'synthesising'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {stage === 'synthesising' ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate with {uploadedPapers.length > 0 ? `${uploadedPapers.length} uploaded + ` : ''}all papers</>
              )}
            </Button>
          </TabsContent>

          {/* Review tab */}
          <TabsContent value="review" className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-4">
            {synthesis && (
              <>
                {/* Provider badge */}
                {synthesis.providerUsed && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-600 dark:text-zinc-400">
                      ✨ Generated by {synthesis.providerUsed}
                      {synthesis.modelUsed && <span className="ml-1 opacity-60">· {synthesis.modelUsed}</span>}
                    </span>
                    <span className="opacity-50">Change model in Settings</span>
                  </div>
                )}

                <div className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                  {synthesis.coverageNote}
                </div>

                {/* Thematic narrative */}
                {synthesis.thematicNarrative && (
                  <Section title="Thematic Literature Review" onInsert={() => onInsertToEditor?.(synthesis.thematicNarrative)}>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {synthesis.thematicNarrative}
                    </div>
                  </Section>
                )}

                {/* Annotated bibliography */}
                <Section title="Annotated Bibliography Table" onInsert={() => onInsertToEditor?.(synthesis.annotatedBibliography)}>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {synthesis.annotatedBibliography}
                  </pre>
                </Section>

                {/* Empirical matrix */}
                <Section title="Empirical Literature Matrix" onInsert={() => onInsertToEditor?.(synthesis.empiricalMatrix)}>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {synthesis.empiricalMatrix}
                  </pre>
                </Section>

                {/* Research gap */}
                {synthesis.researchGapSummary && (
                  <Section title="Research Gap Summary" onInsert={() => onInsertToEditor?.(synthesis.researchGapSummary)}>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {synthesis.researchGapSummary}
                    </div>
                  </Section>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state */}
      {stage === 'idle' && !result && (
        <div className="flex-1 flex items-center justify-center p-10 text-center">
          <div>
            <Search className="w-12 h-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="font-medium text-zinc-400 dark:text-zinc-500 mb-2">
              Start your literature search
            </h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-600 max-w-xs">
              Enter your research topic and the system will search across 7+ academic databases,
              extract full texts, and generate your literature review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Paper card ───────────────────────────────────────────────────────────────

function PaperCard({ paper }: { paper: EnrichedPaper }) {
  const [expanded, setExpanded] = useState(false);
  const authorStr = paper.authors.length > 2
    ? `${paper.authors[0]} et al.`
    : paper.authors.join(', ');

  const statusBadge = paper.fullText
    ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">🟢 Full text</span>
    : paper.fullTextStatus === 'open-access'
    ? <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">🟡 Open access</span>
    : paper.fullTextStatus === 'paywalled'
    ? <span className="text-xs text-red-500 dark:text-red-400 font-medium">🔴 Paywalled</span>
    : <span className="text-xs text-zinc-400 font-medium">⚪ Abstract</span>;

  return (
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
            {paper.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {authorStr} · {paper.year} · <em>{paper.journal}</em>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {statusBadge}
          <span className="text-xs text-zinc-400">{paper.sourceDatabase}</span>
        </div>
      </div>

      {paper.abstract && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
        >
          {expanded ? 'Hide abstract' : 'Show abstract'}
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      )}
      {expanded && paper.abstract && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-6">
          {paper.abstract}
        </p>
      )}
    </div>
  );
}

// ─── Review section ────────────────────────────────────────────────────────────

function Section({ title, children, onInsert }: { title: string; children: React.ReactNode; onInsert?: () => void }) {
  return (
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</span>
        {onInsert && (
          <Button variant="ghost" size="sm" onClick={onInsert} className="h-7 text-xs text-indigo-600">
            Insert to Editor
          </Button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatusBar({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="text-indigo-500">{icon}</span>
      {text}
    </div>
  );
}
