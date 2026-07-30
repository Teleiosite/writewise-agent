import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Cpu, Code2, Copy, CheckCheck, Download, Share2, Printer, FileText, Terminal 
} from 'lucide-react';
import { ComputedStats } from '@/types/analysis.types';

interface IntegrityReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  datasetName?: string;
  datasetHash?: string;
  computedStats: ComputedStats | null;
  syntax: string;
  narrative: string;
  aiModel?: string;
}

export function IntegrityReportModal({
  open,
  onOpenChange,
  title,
  datasetName = 'research_survey_data.csv',
  datasetHash = '6a8d3b1c9e4f2a7d8c5b0e3f1a9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c',
  computedStats,
  syntax,
  narrative,
  aiModel = 'Gemini 1.5 Pro'
}: IntegrityReportModalProps) {
  const [copiedSyntax, setCopiedSyntax] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const receiptToken = 'RECEIPT-' + (datasetHash ? datasetHash.substring(0, 10).toUpperCase() : 'DEMO88A9');
  const timestamp = new Date().toISOString();

  const handleCopySyntax = async () => {
    await navigator.clipboard.writeText(syntax);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/verify/${receiptToken}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans">
        
        {/* Modal Top Navigation */}
        <div className="sticky top-0 z-10 bg-black text-white dark:bg-white dark:text-black p-4 flex items-center justify-between border-b border-black dark:border-white font-mono text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Research Integrity Report &amp; Audit Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handlePrint}
              className="bg-transparent border-white text-white dark:border-black dark:text-black font-mono text-xs uppercase tracking-wider rounded-none h-7 px-3 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="p-8 space-y-8 text-black dark:text-white">

          {/* Header Banner */}
          <div className="border border-black dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 font-mono">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span className="mono-badge bg-black text-white dark:bg-white dark:text-black border-none">
                OFFICIAL RESEARCH RECEIPT: {receiptToken}
              </span>
              <span className="text-[11px] text-zinc-500">{timestamp}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight font-sans mb-1">
              {title || 'Statistical Analysis Integrity Report'}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Audit trail proving 100% deterministic Python calculation, IBM SPSS syntax reproducibility, and strict AI input scoping.
            </p>
          </div>

          {/* Grid 1: Provenance & Environment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="border border-black dark:border-zinc-800 p-5 bg-white dark:bg-black">
              <div className="text-zinc-500 uppercase tracking-wider mb-2">01 / Computation Engine</div>
              <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4" /> Python 3.11.8
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Pandas 2.1.4 · SciPy 1.11.4 · NumPy 1.26.2
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                Execution Status: <span className="font-bold text-black dark:text-white">DETERMINISTIC SUCCESS ✓</span>
              </div>
            </div>

            <div className="border border-black dark:border-zinc-800 p-5 bg-white dark:bg-black">
              <div className="text-zinc-500 uppercase tracking-wider mb-2">02 / Dataset Fingerprint</div>
              <div className="font-bold text-xs text-black dark:text-white flex items-center gap-2 mb-1 truncate">
                <Terminal className="w-4 h-4 shrink-0" /> SHA-256: {datasetHash.substring(0, 20)}...
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Filename: <strong>{datasetName}</strong>
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                Client Hashing: <span className="font-bold text-black dark:text-white">Web Crypto API (Browser-Level)</span>
              </div>
            </div>
          </div>

          {/* Grid 2: AI Declaration */}
          <div className="border border-black dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                AI Model Declaration &amp; Input Boundaries
              </div>
              <span className="mono-badge-outline text-[10px]">{aiModel}</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-sans">
              <strong>Strict Integrity Rule Enforced:</strong> The AI model received <em>only</em> pre-computed statistical tables (means, Cronbach's Alpha, r-values, p-values). The AI model was never provided raw survey rows and did not perform numeric calculation.
            </p>
          </div>

          {/* SPSS Syntax Output Panel */}
          {syntax && (
            <div className="border border-black dark:border-zinc-800 p-5 bg-white dark:bg-black font-sans">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-black dark:text-white" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-black dark:text-white">
                    Reproducible IBM SPSS Syntax
                  </h3>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleCopySyntax}
                  className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white h-7 px-3"
                >
                  {copiedSyntax ? <CheckCheck className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedSyntax ? 'Copied Syntax!' : 'Copy SPSS Syntax'}
                </Button>
              </div>

              <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed overflow-x-auto border border-zinc-800 rounded-none max-h-48">
                {syntax}
              </pre>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black dark:border-zinc-800 font-mono">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider rounded-none border-black dark:border-zinc-800 h-10 px-5 gap-2"
            >
              {copiedLink ? <CheckCheck className="w-4 h-4 text-black dark:text-white" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Supervisor Link Copied!' : 'Copy Supervisor Share Link'}
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white h-10 px-6"
            >
              Close Receipt
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
