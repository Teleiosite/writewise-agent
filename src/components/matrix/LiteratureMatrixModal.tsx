import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, Table, BookOpen, Plus, Copy, Check, 
  Download, Loader2, RefreshCw, Edit2, ExternalLink 
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
  const [topic, setTopic] = useState(defaultTopic || "Transformational leadership and employee turnover intention in banking");
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
      toast.info("Searching 350M+ open scholarly papers & extracting empirical parameters...");
      const result = await generateLiteratureMatrix(topic, studyCount);
      setMatrixResult(result);
      toast.success(`Generated Empirical Matrix with ${result.studies.length} peer-reviewed studies!`);
    } catch (err: any) {
      toast.error(`Matrix generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (!matrixResult) return;
    const md = formatMatrixToMarkdownTable(matrixResult);
    onInsertToChapter(md);
    toast.success("Empirical Synthesis Matrix inserted into Chapter 2!");
    onClose();
  };

  const handleAddAllCitations = () => {
    if (!matrixResult || !onAddCitationsToLibrary) return;
    const citations = matrixResult.studies.map(s => s.citation);
    onAddCitationsToLibrary(citations);
    toast.success(`Added all ${citations.length} empirical papers to your Citation Library!`);
  };

  const handleCopyMarkdown = () => {
    if (!matrixResult) return;
    navigator.clipboard.writeText(formatMatrixToMarkdownTable(matrixResult));
    setCopiedMd(true);
    toast.success("Markdown Table copied to clipboard");
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyHtml = () => {
    if (!matrixResult) return;
    const html = formatMatrixToHtmlTable(matrixResult);
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([formatMatrixToMarkdownTable(matrixResult)], { type: "text/plain" });
    const item = new ClipboardItem({ "text/html": blob, "text/plain": textBlob });
    navigator.clipboard.write([item]).then(() => {
      setCopiedHtml(true);
      toast.success("Rich APA 7th Table copied! Ready to paste into Word or Docs.");
      setTimeout(() => setCopiedHtml(false), 2000);
    }).catch(() => {
      navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      toast.success("HTML table copied to clipboard");
      setTimeout(() => setCopiedHtml(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono-badge text-[10px]">Chapter 2 Suite</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                Empirical Literature Matrix Generator
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Auto-extracts sample size (N), statistical methodology, empirical coefficients, and research gaps from 350M+ papers.
            </p>
          </div>

          {matrixResult && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHtml}
                className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy for Word
              </Button>

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

        {/* Search & Topic Configuration Bar */}
        <form onSubmit={handleGenerate} className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Enter research topic, hypotheses, or key variables (e.g. AI adoption and customer satisfaction)..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="h-10 rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono"
            />
          </div>

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
                  Synthesizing Papers...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Matrix
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
                Mining Scholarly Repositories &amp; Extracting Empirical Matrix...
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm font-sans">
                Querying OpenAlex &amp; Semantic Scholar, parsing empirical samples, statistical models (SEM/Regression), and findings across peer-reviewed publications.
              </p>
            </div>
          ) : matrixResult ? (
            <div className="space-y-6">
              {/* Matrix Table */}
              <div className="border border-black dark:border-zinc-800 overflow-x-auto bg-white dark:bg-black">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b-2 border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] uppercase tracking-wider text-black dark:text-white">
                      <th className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[18%]">Author(s) &amp; Year</th>
                      <th className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[18%]">Sample Size &amp; Pop.</th>
                      <th className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[20%]">Methodology &amp; Model</th>
                      <th className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[24%]">Key Empirical Findings</th>
                      <th className="p-3 w-[20%]">Research Gap / Limitation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixResult.studies.map((study, idx) => (
                      <tr 
                        key={study.id} 
                        className={`border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-950/50 ${
                          idx % 2 === 1 ? 'bg-zinc-50/50 dark:bg-zinc-950/30' : ''
                        }`}
                      >
                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                          <div className="font-bold text-black dark:text-white mb-1">
                            {study.authorYear}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[160px]" title={study.title}>
                            {study.title}
                          </div>
                          {study.doi && (
                            <a
                              href={`https://doi.org/${study.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-zinc-400 hover:underline flex items-center gap-0.5 mt-1"
                            >
                              doi:{study.doi.substring(0, 15)}... <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                        </td>

                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {study.sampleSize}
                        </td>

                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 inline-block mb-1">
                            {study.methodology}
                          </span>
                        </td>

                        <td className="p-3 align-top border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {study.keyFindings}
                        </td>

                        <td className="p-3 align-top text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                          {study.researchGap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Synthesis Narrative */}
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
                  Ready to Build Chapter 2 Literature Matrix
                </h4>
                <p className="text-xs text-zinc-500 font-sans">
                  Enter your thesis topic or variables above and click <strong>"Generate Matrix"</strong>. WriteWise will synthesize 8–15 peer-reviewed studies into a publication-ready APA 7th matrix table.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
