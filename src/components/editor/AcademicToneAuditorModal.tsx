import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Sparkles, 
  ArrowRight, Copy, Check, Loader2, RefreshCw, BookOpen 
} from "lucide-react";
import { toast } from "sonner";
import { 
  auditAcademicTone, 
  ToneAuditResult 
} from "@/services/academicToneAuditor";

interface AcademicToneAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onApplyEnhancedText: (newText: string) => void;
}

export function AcademicToneAuditorModal({
  isOpen,
  onClose,
  currentText,
  onApplyEnhancedText
}: AcademicToneAuditorModalProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<ToneAuditResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && currentText.trim()) {
      runAudit();
    }
  }, [isOpen, currentText]);

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      toast.info("Scanning for generic AI phrases & Turnitin flags...");
      const auditRes = await auditAcademicTone(currentText);
      setResult(auditRes);
      toast.success(`Academic Rigor Audit complete: Score ${auditRes.rigorScore}%`);
    } catch (err: any) {
      toast.error(`Audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApply = () => {
    if (!result?.enhancedText) return;
    onApplyEnhancedText(result.enhancedText);
    toast.success("Applied elevated academic prose to your active section!");
    onClose();
  };

  const handleCopy = () => {
    if (!result?.enhancedText) return;
    navigator.clipboard.writeText(result.enhancedText);
    setCopied(true);
    toast.success("Enhanced academic text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono-badge text-[10px]">Integrity Suite</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                Pre-Submission Academic Tone &amp; Turnitin Rigor Auditor
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Identifies generic AI hallmark clichés ("delve into", "tapestry", "beacon") and elevates draft text to formal postgraduate dissertation rigor.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 rounded-none border-black dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Enhanced Text
              </Button>

              <Button
                size="sm"
                onClick={handleApply}
                className="h-8 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-[10px] uppercase tracking-wider border border-black dark:border-white gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Apply to Document
              </Button>
            </div>
          )}
        </div>

        {/* Score & Health Summary Bar */}
        {result && !isAuditing && (
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-2.5 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase">Academic Rigor:</span>
              <span className={`text-base font-bold ${
                result.rigorScore >= 80 ? 'text-emerald-600' : result.rigorScore >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {result.rigorScore} / 100
              </span>
            </div>

            <div className="p-2.5 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase">AI Hallmarks Risk:</span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${
                result.aiSimilarityRisk === 'Low' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700' :
                result.aiSimilarityRisk === 'Moderate' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950 text-amber-700' :
                'border-red-600 bg-red-50 dark:bg-red-950 text-red-700'
              }`}>
                {result.aiSimilarityRisk} Risk
              </span>
            </div>

            <div className="p-2.5 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase">Stylistic Issues:</span>
              <span className="text-xs font-bold text-black dark:text-white">
                {result.totalIssuesCount} Phrases Flagged
              </span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {isAuditing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3 font-mono text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Auditing Academic Prose &amp; Scanning Sentence Perplexity...
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm font-sans">
                Flagging generic AI transitions, checking quantitative claims, and formulating peer-reviewed scholarly revisions.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Flagged Issues Chips */}
              {result.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-black dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Flagged Stylistic &amp; AI Hallmark Items ({result.issues.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.issues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 font-sans space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="font-bold text-red-600 dark:text-red-400">
                            "{issue.matchedText}"
                          </span>
                          <span className="text-zinc-400 uppercase text-[9px]">
                            {issue.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                          {issue.explanation}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                          ➔ {issue.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Text */}
                <div className="border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 space-y-2 flex flex-col">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Draft Input Text</span>
                    <span className="text-[10px]">{currentText.split(/\s+/).length} words</span>
                  </div>
                  <div className="flex-1 text-xs font-sans text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                    {currentText}
                  </div>
                </div>

                {/* Enhanced Oxford/Harvard Academic Text */}
                <div className="border border-black dark:border-zinc-700 bg-white dark:bg-black p-4 space-y-2 flex flex-col shadow-sm">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-black dark:text-white" />
                      Enhanced Academic Prose
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Rigor Optimized</span>
                  </div>
                  <div className="flex-1 text-xs font-sans text-black dark:text-white leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1 border-t border-zinc-100 dark:border-zinc-900 pt-2">
                    {result.enhancedText}
                  </div>
                </div>
              </div>

              {/* Summary Review Narrative */}
              {result.summaryFeedback && (
                <div className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase text-[10px] block text-black dark:text-white mb-0.5">
                      Peer Reviewer Assessment
                    </span>
                    <p className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400">
                      {result.summaryFeedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
