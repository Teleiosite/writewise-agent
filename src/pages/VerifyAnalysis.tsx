import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Cpu, Code2, Copy, CheckCheck, ArrowLeft, Terminal, AlertCircle, Loader2
} from 'lucide-react';
import { fetchReceiptByToken, ResearchReceipt } from '@/services/receiptService';

export default function VerifyAnalysis() {
  const { token } = useParams<{ token?: string }>();
  const [copiedSyntax, setCopiedSyntax] = useState(false);
  const [receipt, setReceipt] = useState<ResearchReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetchReceiptByToken(token).then(data => {
      if (!data) setNotFound(true);
      else setReceipt(data);
      setLoading(false);
    });
  }, [token]);

  const handleCopySyntax = async () => {
    if (!receipt?.payload.syntax) return;
    await navigator.clipboard.writeText(receipt.payload.syntax);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><Logo size="md" /></Link>
            <span className="mono-badge">Supervisor Verification Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/app">
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white">
                Enter Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
          {token && (
            <div className="font-mono text-xs text-zinc-500 hidden sm:block">
              TOKEN: <span className="font-bold text-black dark:text-white">{token.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Fetching verification receipt...</p>
          </div>
        )}

        {!loading && notFound && (
          <div className="border-2 border-black dark:border-zinc-700 p-10 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-4 text-zinc-400" />
            <h1 className="text-xl font-bold font-mono uppercase tracking-wide mb-2">Receipt Not Found</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              No verification receipt was found for this token. It may have been deleted, or the link may be incorrect.
              Ask the researcher to generate a new verification link from their WriteWise workspace.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <Button size="sm" className="rounded-none font-mono text-xs uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white mt-6">
                Return to WriteWise
              </Button>
            </Link>
          </div>
        )}

        {!loading && receipt && (() => {
          const p = receipt.payload;
          const generatedDate = new Date(p.generatedAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          return (
            <>
              <div className="border border-black dark:border-white p-8 bg-zinc-50 dark:bg-zinc-950 mb-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black text-white dark:bg-white dark:text-black shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="mono-badge mb-2">VERIFIED RESEARCH RECEIPT</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-2">{p.title}</h1>
                    {p.institution && <p className="text-xs text-zinc-500 font-mono mb-2">{p.institution}</p>}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                      Statistical computations executed by <strong>Python (Pandas + SciPy)</strong> — not by AI. Generated {generatedDate}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 font-mono text-xs">
                <div className="border border-black dark:border-zinc-800 p-5">
                  <div className="text-zinc-500 uppercase tracking-wider mb-2">01 / Engine</div>
                  <div className="font-bold text-sm flex items-center gap-2 mb-1"><Cpu className="w-4 h-4" /> {p.pythonVersion}</div>
                  <p className="text-zinc-500 text-[11px]">Zero LLM numeric modification.</p>
                </div>
                <div className="border border-black dark:border-zinc-800 p-5">
                  <div className="text-zinc-500 uppercase tracking-wider mb-2">02 / SHA-256 Fingerprint</div>
                  <div className="font-bold text-[11px] flex items-center gap-1 mb-1 break-all">
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    {p.datasetHash ? p.datasetHash.substring(0, 20) + '...' : '—'}
                  </div>
                  <p className="text-zinc-500 text-[11px]">File: <strong>{p.datasetName}</strong></p>
                </div>
                <div className="border border-black dark:border-zinc-800 p-5">
                  <div className="text-zinc-500 uppercase tracking-wider mb-2">03 / AI Model</div>
                  <div className="font-bold text-sm mb-1">{p.aiModel || '—'}</div>
                  <p className="text-zinc-500 text-[11px]">Used only to narrate verified outputs.</p>
                </div>
              </div>

              {p.testsRun && p.testsRun.length > 0 && (
                <div className="border border-black dark:border-zinc-800 p-6 mb-10">
                  <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">Statistical Tests Executed</div>
                  <div className="flex flex-wrap gap-2">
                    {p.testsRun.map(test => (
                      <span key={test} className="px-3 py-1 border border-black dark:border-zinc-700 font-mono text-[11px] uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950">
                        {test.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {p.syntax && (
                <div className="border border-black dark:border-zinc-800 p-6 mb-10">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      <h2 className="font-mono font-bold text-sm uppercase tracking-wider">IBM SPSS Reproducibility Syntax</h2>
                    </div>
                    <Button size="sm" onClick={handleCopySyntax}
                      className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white">
                      {copiedSyntax ? <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                      {copiedSyntax ? 'Copied!' : 'Copy SPSS Syntax'}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mb-4">
                    Copy this syntax and run it in IBM SPSS Statistics to reproduce the exact outputs.
                  </p>
                  <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed overflow-x-auto border border-zinc-800">
                    {p.syntax}
                  </pre>
                </div>
              )}

              <div className="p-6 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
                <div className="font-bold uppercase mb-1">Academic Integrity Guarantee</div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  WriteWise enforces strict separation of concerns: Python computes all statistical matrices while AI models only receive structured output tables for narrative drafting. The SHA-256 fingerprint identifies the exact dataset used. All claims can be independently reproduced using the SPSS syntax above.
                </p>
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
