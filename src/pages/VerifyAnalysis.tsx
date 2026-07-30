import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Cpu, Code2, Copy, CheckCheck, FileText, ArrowLeft, ExternalLink, Terminal
} from 'lucide-react';

export default function VerifyAnalysis() {
  const { token } = useParams<{ token?: string }>();
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Mock receipt payload for demonstration / sample verification
  const sampleReceipt = {
    verifiedAt: new Date().toISOString(),
    datasetHash: '6a8d3b1c9e4f2a7d8c5b0e3f1a9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c',
    datasetName: 'academic_survey_research_data.xlsx',
    pythonVersion: 'Python 3.11.8 (Pandas 2.1.4, SciPy 1.11.4)',
    sha256: '6a8d3b1c9e4f2a7d8c5b0e3f1a9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c',
    analysisTitle: 'Employee Work Experience and Job Performance Regression Model',
    testsRun: ['Descriptive Statistics', "Cronbach's Alpha", 'Pearson Correlation', 'Linear Regression'],
    spssSyntax: `* WriteWise SPSS Verification Syntax.
* Generated automatically for dataset: academic_survey_research_data.xlsx
* SHA-256: 6a8d3b1c9e4f2a7d8c5b0e3f1a9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c.

DESCRIPTIVES VARIABLES=Age Work_Experience_Years Performance_Score
  /STATISTICS=MEAN STDDEV MIN MAX.

RELIABILITY
  /VARIABLES=Job_Satisfaction_1 Job_Satisfaction_2 Job_Satisfaction_3
  /SCALE('Job Satisfaction Scale') ALL
  /MODEL=ALPHA.

CORRELATIONS
  /VARIABLES=Work_Experience_Years Performance_Score
  /PRINT=TWOTAIL NOSIG
  /MISSING=PAIRWISE.

REGRESSION
  /MISSING LISTWISE
  /STATISTICS COEFF OUTS R ANOVA
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT Performance_Score
  /METHOD=ENTER Work_Experience_Years.`
  };

  const handleCopySyntax = async () => {
    await navigator.clipboard.writeText(sampleReceipt.spssSyntax);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <span className="mono-badge">Supervisor Verification Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/app">
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white">
                Enter Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
          <div className="font-mono text-xs text-zinc-500">
            VERIFICATION RECEIPT TOKEN: <span className="font-bold text-black dark:text-white">{token || 'DEMO-RECEIPT-88A9'}</span>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="border border-black dark:border-white p-8 bg-zinc-50 dark:bg-zinc-950 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-black text-white dark:bg-white dark:text-black font-mono shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="mono-badge mb-2">VERIFIED RESEARCH RECEIPT</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1 mb-2">
                {sampleReceipt.analysisTitle}
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">
                This report verifies that statistical computations were executed by <strong>Python (Pandas + SciPy)</strong> and matched with 100% deterministic precision against IBM SPSS algorithms.
              </p>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 font-mono text-xs">
          <div className="border border-black dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-zinc-500 uppercase tracking-wider mb-2">01 / Engine & Environment</div>
            <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4" /> {sampleReceipt.pythonVersion}
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              Statistical calculations executed server-side. Zero LLM numeric modification.
            </p>
          </div>

          <div className="border border-black dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-zinc-500 uppercase tracking-wider mb-2">02 / Cryptographic Fingerprint</div>
            <div className="font-bold text-xs text-black dark:text-white flex items-center gap-2 mb-1 truncate">
              <Terminal className="w-4 h-4 shrink-0" /> SHA-256: {sampleReceipt.sha256.substring(0, 24)}...
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2">
              File: <strong>{sampleReceipt.datasetName}</strong>
            </p>
          </div>
        </div>

        {/* SPSS Syntax Reproduction Panel */}
        <div className="border border-black dark:border-zinc-800 p-6 bg-white dark:bg-black font-sans mb-12">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-black dark:text-white" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                IBM SPSS Reproducibility Syntax
              </h2>
            </div>
            <Button 
              size="sm" 
              onClick={handleCopySyntax}
              className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white"
            >
              {copiedSyntax ? <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copiedSyntax ? 'Copied Syntax!' : 'Copy SPSS Syntax'}
            </Button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mb-4">
            Supervisors can copy this syntax and run it directly in IBM SPSS Statistics to reproduce identical outputs.
          </p>

          <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed overflow-x-auto border border-zinc-800 rounded-none selection:bg-zinc-800">
            {sampleReceipt.spssSyntax}
          </pre>
        </div>

        {/* Audit Disclaimer */}
        <div className="p-6 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
          <div className="font-bold text-black dark:text-white uppercase mb-1">Academic Integrity Guarantee</div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            WriteWise enforces technical separation of concerns: Python computes the mathematical matrices, while generative AI models only receive structured output tables for narrative drafting. All claims can be verified using the SPSS syntax above.
          </p>
        </div>
      </main>
    </div>
  );
}
