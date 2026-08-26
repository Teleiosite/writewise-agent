import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, Table, BookOpen, Plus, Copy, Check, 
  Loader2, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { 
  generateLiteratureMatrix, 
  formatMatrixToMarkdownTable, 
  formatMatrixToHtmlTable,
  LiteratureMatrixResult, 
  EmpiricalStudyEntry 
} from "@/services/literatureMatrixService";
import { AcademicCitation } from "@/services/citationEngine";

interface LiteratureMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  onInsertToChapter: (content: string) => void;
  onAddCitationsToLibrary?: (citations: AcademicCitation[]) => void;
}

export function LiteratureMatrixModal({
  isOpen,
  onClose,
  defaultTopic = "",
  onInsertToChapter,
  onAddCitationsToLibrary
}: LiteratureMatrixModalProps) {
  const [topic, setTopic] = useState(defaultTopic || "Social media marketing and student entrepreneurship");
  const [studyCount, setStudyCount] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(false);
  const [matrixResult, setMatrixResult] = useState<LiteratureMatrixResult | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a research topic or variables.");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Searching scholarly databases & building your annotated bibliography...");
      const result = await generateLiteratureMatrix(topic, studyCount);
      setMatrixResult(result);
      toast.success(`Generated ${result.studies.length} studies for your literature review!`);
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (!matrixResult) return;
    onInsertToChapter(formatMatrixToMarkdownTable(matrixResult));
    toast.success("Annotated bibliography inserted into Chapter 2!");
    onClose();
  };

  const handleAddAllCitations = () => {
    if (!matrixResult || !onAddCitationsToLibrary) return;
    const citations = matrixResult.studies.map(s => s.citation);
    onAddCitationsToLibrary(citations);
    toast.success(`Added ${citations.length} papers to your Citation Library!`);
  };

  const handleCopyHtml = () => {
    if (!matrixResult) return;
    const html = formatMatrixToHtmlTable(matrixResult);
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([formatMatrixToMarkdownTable(matrixResult)], { type: "text/plain" });
    const item = new ClipboardItem({ "text/html": blob, "text/plain": textBlob });
    navigator.clipboard.write([item]).then(() => {
      setCopiedHtml(true);
      toast.success("Copied! Paste directly into Microsoft Word.");
      setTimeout(() => setCopiedHtml(false), 2500);
    }).catch(() => {
      navigator.clipboard.writeText(formatMatrixToMarkdownTable(matrixResult));
      setCopiedMd(true);
      toast.success("Markdown table copied to clipboard.");
      setTimeout(() => setCopiedMd(false), 2500);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] w-[1200px] h-[90vh] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono-badge text-[10px]">Chapter 2 Suite</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                Annotated Bibliography Generator
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Generates a supervisor-ready annotated bibliography table: Author · Article Title · Problem Statement · Methodology · Findings · Research Gaps
            </p>
          </div>

          {matrixResult && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {onAddCitationsToLibrary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAllCitations}
                  className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add All to Citations
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHtml}
                className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
              >
                {copiedHtml || copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy for Word
              </Button>

              <Button
                size="sm"
                onClick={handleInsert}
                className="h-8 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-[10px] uppercase tracking-wider border border-black dark:border-white gap-1"
              >
                <Table className="w-3.5 h-3.5" />
                Insert to Chapter 2
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleGenerate}
          className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs shrink-0"
        >
          <Input
            placeholder='Enter research topic or dissertation title (e.g. "Social media use and student entrepreneurship in Nigerian universities")...'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-10 rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono"
          />

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={studyCount}
              onChange={(e) => setStudyCount(Number(e.target.value))}
              disabled={isLoading}
              className="h-10 px-3 border border-black dark:border-zinc-700 bg-white dark:bg-black font-mono text-xs rounded-none"
            >
              <option value={5}>5 Studies</option>
              <option value={8}>8 Studies (Standard)</option>
              <option value={12}>12 Studies (Comprehensive)</option>
              <option value={15}>15 Studies (Doctoral)</option>
            </select>

            <Button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="h-10 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-5 border border-black dark:border-white shrink-0 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Bibliography
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3 font-mono text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Searching Scholarly Databases &amp; Building Annotated Bibliography...
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm font-sans">
                Querying OpenAlex, Semantic Scholar &amp; Crossref. Extracting problem statements, methodologies, findings, and research gaps.
              </p>
            </div>

          ) : matrixResult ? (
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center font-mono border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Annotated Bibliography on</p>
                <p className="text-sm font-bold text-black dark:text-white">"{matrixResult.topic}"</p>
                <p className="text-[10px] text-zinc-400 mt-1">{matrixResult.studies.length} peer-reviewed studies · APA 7th format</p>
              </div>

              {/* Annotated Bibliography Table */}
              <div className="border border-black dark:border-zinc-800 overflow-x-auto bg-white dark:bg-black">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[900px]">
                  <thead>
                    <tr className="border-b-2 border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 font-mono text-[10px] uppercase tracking-wider text-black dark:text-white">
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 text-center w-10">S/N</th>
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 w-[14%]">Name(s) of Author(s) &amp; Year</th>
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 w-[15%]">Article Title</th>
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 w-[17%]">Problem Statement</th>
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 w-[15%]">Methodology</th>
                      <th className="p-3 border-r border-zinc-300 dark:border-zinc-800 w-[20%]">Findings</th>
                      <th className="p-3 w-[17%]">Research Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixResult.studies.map((study: EmpiricalStudyEntry, idx: number) => (
                      <tr
                        key={study.id}
                        className={`border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-950/50 ${
                          idx % 2 === 1 ? "bg-zinc-50/40 dark:bg-zinc-950/20" : ""
                        }`}
                      >
                        {/* S/N */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-center font-mono font-bold text-zinc-500 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Author & Year */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                          <div className="font-bold text-black dark:text-white leading-snug">
                            {study.authorYear}
                          </div>
                          {study.doi && (
                            <a
                              href={`https://doi.org/${study.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5 mt-1"
                            >
                              doi:{study.doi.substring(0, 16)}... <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                        </td>

                        {/* Article Title */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 italic leading-snug">
                          {study.title}
                        </td>

                        {/* Problem Statement */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {study.problemStatement}
                        </td>

                        {/* Methodology */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800">
                          <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 inline-block leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {study.methodology}
                          </span>
                        </td>

                        {/* Findings */}
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {study.keyFindings}
                        </td>

                        {/* Research Gaps */}
                        <td className="p-3 align-top text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                          {study.researchGap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Literature Synthesis Narrative */}
              {matrixResult.synthesisSummary && (
                <div className="p-4 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2 font-sans">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    <BookOpen className="w-4 h-4" />
                    Chapter 2 Literature Synthesis Narrative
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {matrixResult.synthesisSummary}
                  </p>
                </div>
              )}
            </div>

          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 font-sans">
              <div className="w-12 h-12 rounded-none border border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <Table className="w-6 h-6 text-black dark:text-white" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Ready to Build Your Annotated Bibliography
                </h4>
                <p className="text-xs text-zinc-500 font-sans">
                  Enter your dissertation topic or research question above. WriteWise will generate a supervisor-ready annotated bibliography table with real peer-reviewed papers — including problem statements, methodologies, findings, and research gaps.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
