import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Search, RefreshCw, Copy, CheckCheck, FileText 
} from 'lucide-react';
import { ComputedStats } from '@/types/analysis.types';
import { auditChapterClaims, ClaimAuditReport } from '@/services/claimAuditorService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClaimVerificationPanelProps {
  computedStats?: ComputedStats | null;
  narrativeText?: string;
  analysisId?: string;
}

const DEFAULT_SAMPLE_PROSE = `4.1 Overview of Results
The empirical study evaluated employee work experience and overall job performance across N = 150 respondents.

4.2 Scale Reliability
Overall scale reliability for the Job Satisfaction subscale demonstrated high internal consistency (α = 0.842), confirming that the instrument items reliably measure the underlying construct.

4.3 Descriptive Statistics
The primary Independent Variable (Work Experience) yielded a mean score of M = 4.12 (SD = 0.84).

4.4 Regression and Hypothesis Testing
Simple linear regression indicated a statistically significant positive relationship between Work Experience and Job Performance (r = 0.724, p = 0.003). Therefore, Hypothesis 1 is supported.`;

export function ClaimVerificationPanel({ computedStats, narrativeText = '', analysisId }: ClaimVerificationPanelProps) {
  const [inputText, setInputText] = useState(narrativeText || DEFAULT_SAMPLE_PROSE);
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<ClaimAuditReport | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleRunAudit = () => {
    if (!inputText.trim()) {
      toast.error('Please enter Chapter draft text to audit.');
      return;
    }
    setIsAuditing(true);

    setTimeout(() => {
      // Run real deterministic NLP extraction engine
      const auditResult = auditChapterClaims(inputText, computedStats, analysisId);
      setReport(auditResult);
      setIsAuditing(false);
      toast.success(`Audit complete: ${auditResult.claims.length} claims extracted and verified.`);
    }, 400);
  };

  const handleCopyReportText = async () => {
    if (!report) return;
    const reportText = `WRITEWISE CLAIM VERIFICATION AUDIT REPORT
Timestamp: ${report.timestamp}
Total Claims Audited: ${report.totalClaimsCount}
Verified Claims: ${report.verifiedCount}
Discrepancies: ${report.discrepancyCount}

CLAIMS BREAKDOWN:
${report.claims.map(c => `[Line ${c.lineNumber}] [${c.status}] ${c.claimType}: Claimed "${c.claimedNotation}" vs Verified "${c.verifiedValue}"\nExplanation: ${c.explanation}`).join('\n\n')}`;

    await navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    toast.success('Audit Report copied to clipboard!');
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="border border-black dark:border-white p-6 bg-zinc-50 dark:bg-zinc-950 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <span className="mono-badge bg-black text-white dark:bg-white dark:text-black border-none">
            DETERMINISTIC NLP CLAIM AUDITOR
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-black dark:text-white tracking-tight font-sans">
          Audit Chapter Prose Against Verified Statistical Outputs
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          WriteWise's deterministic regex parser extracts statistical notation claims ($r$, $p$, $\alpha$, $M$) from text and cross-references each figure against Python engine outputs.
        </p>
      </div>

      {/* Input Text Area */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Chapter Draft Text for Audit
          </label>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span>{inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button
              onClick={() => setInputText(DEFAULT_SAMPLE_PROSE)}
              className="underline text-black dark:text-white hover:opacity-80"
            >
              Reset to Sample Prose
            </button>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your Chapter 4 (Results) or Chapter 5 (Discussion) draft text here..."
          rows={7}
          className="w-full p-4 border border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white leading-relaxed"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleRunAudit}
            disabled={isAuditing || !inputText.trim()}
            className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white h-10 px-6 gap-2"
          >
            {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isAuditing ? 'Executing Deterministic Audit...' : 'Audit Statistical Claims'}
          </Button>
        </div>
      </div>

      {/* Audit Results Section */}
      {report && (
        <div className="space-y-6 pt-4 border-t border-black dark:border-zinc-800">
          
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="border border-black dark:border-zinc-800 p-4 bg-white dark:bg-black">
              <div className="text-zinc-500 uppercase tracking-wider mb-1">Total Claims Extracted</div>
              <div className="text-2xl font-extrabold text-black dark:text-white">{report.totalClaimsCount}</div>
            </div>
            <div className="border border-black dark:border-zinc-800 p-4 bg-white dark:bg-black">
              <div className="text-zinc-500 uppercase tracking-wider mb-1">Verified Matching</div>
              <div className="text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
                {report.verifiedCount} <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
              </div>
            </div>
            <div className="border border-black dark:border-zinc-800 p-4 bg-white dark:bg-black">
              <div className="text-zinc-500 uppercase tracking-wider mb-1 font-bold">Discrepancies</div>
              <div className="text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
                {report.discrepancyCount} {report.discrepancyCount > 0 && <AlertTriangle className="w-5 h-5 text-black dark:text-white" />}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center font-mono">
            <span className="text-xs font-bold uppercase text-black dark:text-white">Extracted Claims &amp; Verification Evidence</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyReportText}
              className="font-mono text-xs uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5 h-8"
            >
              {copiedReport ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReport ? 'Report Copied!' : 'Copy Audit Report'}
            </Button>
          </div>

          {/* Breakdown Table */}
          <div className="border border-black dark:border-zinc-800 overflow-x-auto bg-white dark:bg-black">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-black dark:border-zinc-800 bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider">
                  <th className="p-3">Line</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Claim Type</th>
                  <th className="p-3">Claimed Notation</th>
                  <th className="p-3">Verified Python Output</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black dark:divide-zinc-800">
                {report.claims.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                    <td className="p-3 font-mono text-zinc-500">L{item.lineNumber}</td>
                    <td className="p-3 font-bold">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] uppercase font-bold",
                        item.status === 'VERIFIED'
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                          : "bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white border-black dark:border-zinc-700"
                      )}>
                        {item.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white">{item.claimType}</td>
                    <td className="p-3 font-mono font-bold text-black dark:text-white">{item.claimedNotation}</td>
                    <td className="p-3 font-mono font-bold text-black dark:text-white">{item.verifiedValue}</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400 font-sans text-xs leading-relaxed max-w-xs">
                      {item.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
