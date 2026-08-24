import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Presentation, Download, Copy, Check, ChevronLeft, 
  ChevronRight, Sparkles, Loader2, FileText, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { 
  DefenseDeckConfig, 
  DefenseSlideContent, 
  buildDefaultDefenseSlides, 
  exportDefenseDeckToPptx 
} from "@/services/defenseDeckService";

interface DefenseDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

export function DefenseDeckModal({
  isOpen,
  onClose,
  projectName
}: DefenseDeckModalProps) {
  const [config, setConfig] = useState<DefenseDeckConfig>({
    projectName: projectName || "Empirical Research Dissertation",
    authorName: "Postgraduate Researcher",
    degree: "Doctor of Philosophy (Ph.D.) / Master of Science",
    institution: "Faculty of Graduate Studies & Research",
    problemStatement: "Inconsistent empirical evidence regarding the structural relationships among key predictors and institutional outcomes."
  });

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const slides = buildDefaultDefenseSlides(config);
  const currentSlide = slides[activeSlideIdx];

  const handleDownloadPptx = async () => {
    setIsExporting(true);
    try {
      toast.info("Compiling Microsoft PowerPoint (.pptx) presentation...");
      await exportDefenseDeckToPptx(config);
      toast.success("PowerPoint defense deck downloaded successfully!");
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyOutline = () => {
    let outline = `# ${config.projectName} - Dissertation Defense Deck Outline\n`;
    outline += `Candidate: ${config.authorName} | ${config.degree} | ${config.institution}\n\n`;

    slides.forEach((s, idx) => {
      outline += `## Slide ${idx + 1}: ${s.title}\n`;
      if (s.subtitle) outline += `*${s.subtitle}*\n`;
      if (s.bullets && s.bullets.length > 0) {
        s.bullets.forEach(b => outline += `- ${b}\n`);
      }
      if (s.tableData) {
        outline += `\n| ${s.tableData[0].join(" | ")} |\n`;
        outline += `| ${s.tableData[0].map(() => "---").join(" | ")} |\n`;
        s.tableData.slice(1).forEach(r => outline += `| ${r.join(" | ")} |\n`);
      }
      if (s.highlightBox) outline += `> **Note:** ${s.highlightBox}\n`;
      outline += `\n---\n\n`;
    });

    navigator.clipboard.writeText(outline);
    setCopied(true);
    toast.success("Presentation outline copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono-badge text-[10px]">Defense Suite</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                Thesis Defense Slide Deck Generator (.pptx)
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Compiles problem statement, hypotheses, methodology, and empirical models into a 10-slide PowerPoint presentation for your examination panel.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyOutline}
              className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Outline
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadPptx}
              disabled={isExporting}
              className="h-8 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-[10px] uppercase tracking-wider border border-black dark:border-white gap-1"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download PowerPoint (.pptx)
            </Button>
          </div>
        </div>

        {/* Presentation Metadata Inputs */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Candidate Name</label>
            <Input
              value={config.authorName}
              onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Degree Program</label>
            <Input
              value={config.degree}
              onChange={(e) => setConfig({ ...config, degree: e.target.value })}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Institution / Department</label>
            <Input
              value={config.institution}
              onChange={(e) => setConfig({ ...config, institution: e.target.value })}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
        </div>

        {/* Slide Live Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center">
          {/* Slide Box (16:9 Aspect Ratio) */}
          <div className={`w-full max-w-3xl aspect-[16/9] border border-black dark:border-zinc-800 shadow-2xl p-6 md:p-10 flex flex-col justify-between transition-all duration-300 font-sans ${
            activeSlideIdx === 0 
              ? 'bg-black text-white' 
              : 'bg-white dark:bg-black text-black dark:text-white'
          }`}>
            {/* Slide Header */}
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                {activeSlideIdx === 0 ? "DISSERTATION DEFENSE PRESENTATION" : `SECTION 0${activeSlideIdx} · DISSERTATION DEFENSE`}
              </div>
              <h3 className={`font-bold leading-tight ${
                activeSlideIdx === 0 ? 'text-2xl md:text-3xl font-serif mt-4 text-white' : 'text-xl md:text-2xl font-serif text-black dark:text-white'
              }`}>
                {currentSlide.title}
              </h3>
              {currentSlide.subtitle && (
                <div className={`text-xs md:text-sm mt-1 italic ${
                  activeSlideIdx === 0 ? 'text-zinc-300 mt-3 whitespace-pre-line' : 'text-zinc-500'
                }`}>
                  {currentSlide.subtitle}
                </div>
              )}
            </div>

            {/* Slide Body */}
            <div className="my-4 flex-1 flex flex-col justify-center">
              {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                <ul className="space-y-2 text-xs md:text-sm text-zinc-800 dark:text-zinc-200 list-disc pl-5 font-sans leading-relaxed">
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </ul>
              )}

              {currentSlide.tableData && (
                <div className="overflow-x-auto border border-black dark:border-zinc-800 text-[11px] font-sans">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] uppercase">
                        {currentSlide.tableData[0].map((th, tIdx) => (
                          <th key={tIdx} className="p-2 border-r border-zinc-700 last:border-0">{th}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSlide.tableData.slice(1).map((row, rIdx) => (
                        <tr key={rIdx} className="border-t border-zinc-200 dark:border-zinc-800 font-mono">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800 last:border-0 font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Slide Footer Callout */}
            {currentSlide.highlightBox && (
              <div className={`p-2.5 border text-xs font-mono ${
                activeSlideIdx === 0 
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-300' 
                  : 'border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white'
              }`}>
                {currentSlide.highlightBox}
              </div>
            )}
          </div>
        </div>

        {/* Carousel Slide Thumbnails & Navigation Bar */}
        <div className="p-3 border-t border-black dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between gap-2 font-mono text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
            disabled={activeSlideIdx <= 0}
            className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase px-3 gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev Slide
          </Button>

          {/* Slide Indicator Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIdx(idx)}
                className={`h-7 px-2.5 text-[10px] font-mono border transition-all ${
                  activeSlideIdx === idx
                    ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1))}
            disabled={activeSlideIdx >= slides.length - 1}
            className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase px-3 gap-1"
          >
            Next Slide <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
