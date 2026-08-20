import { HomeLayout } from "@/components/layout/HomeLayout";
import { ShieldCheck, Cpu, Code2, Terminal, CheckCircle2, Lock, FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AcademicIntegrity() {
  const [copied, setCopied] = useState(false);

  const sampleDeclaration = `Data analysis was conducted using WriteWise (Python SciPy/Pandas computational engine) for descriptive statistics, Pearson correlation, and multiple linear regression. Statistical calculations were executed deterministically in Python and independently verified via generated IBM SPSS syntax. Chapter 4 narrative drafting utilized verified statistical summary outputs via Google Gemini / Anthropic Claude for academic formatting compliance with APA 7th Edition guidelines. Full computational provenance and dataset SHA-256 integrity receipt is permanently available at [Insert WriteWise Verification URL].`;

  const handleCopyDeclaration = () => {
    navigator.clipboard.writeText(sampleDeclaration);
    setCopied(true);
    toast.success("Sample methodology declaration copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-4xl mx-auto py-6 font-sans space-y-8">
        {/* Header */}
        <div className="border-b border-black dark:border-zinc-800 pb-6">
          <span className="mono-badge mb-3">Institutional Policy &amp; Ethics</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1">
            Academic Integrity &amp; Verification Standard
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed max-w-2xl">
            How WriteWise enforces deterministic mathematical computation, audit trail provenance, and transparent AI disclosure for postgraduate dissertations and scientific publications.
          </p>
        </div>

        {/* The 4 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
              <Cpu className="w-4 h-4" />
              <span>01 / Deterministic Python Compute</span>
            </div>
            <h3 className="font-bold text-base text-black dark:text-white">Zero Numeric Hallucination</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All means, standard deviations, Pearson correlation coefficients, regression β weights, and p-values are computed by Python (SciPy &amp; Pandas). Large Language Models (LLMs) are never used to calculate, round, or estimate statistical numbers.
            </p>
          </div>

          <div className="p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
              <Lock className="w-4 h-4" />
              <span>02 / Privacy &amp; Survey Data Protection</span>
            </div>
            <h3 className="font-bold text-base text-black dark:text-white">Zero Raw Data Transmission</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Raw survey rows and identifiable participant responses are never sent to external AI servers. Only aggregated statistical summary tables (F, p, r, t, M, SD) are provided to the model strictly for Chapter 4 &amp; 5 academic prose formulation.
            </p>
          </div>

          <div className="p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
              <Code2 className="w-4 h-4" />
              <span>03 / 1-Click SPSS Reproducibility</span>
            </div>
            <h3 className="font-bold text-base text-black dark:text-white">Independent Verification Syntax</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every statistical run generates copy-pasteable IBM SPSS command syntax (.sps) matching your exact variable codebook and test specifications, allowing supervisors and external examiners to replicate all findings in standard university software.
            </p>
          </div>

          <div className="p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
              <Terminal className="w-4 h-4" />
              <span>04 / Cryptographic SHA-256 Audit Trail</span>
            </div>
            <h3 className="font-bold text-base text-black dark:text-white">Immutable Dataset Provenance</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Upon dataset ingestion, a SHA-256 cryptographic hash is generated locally in the researcher's browser. This guarantees that data cannot be altered or falsified post-hoc without altering the verification token.
            </p>
          </div>
        </div>

        {/* Methodology Declaration Card for Dissertations */}
        <div className="border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
              <FileText className="w-4 h-4" />
              <span>Recommended Methodology Declaration</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyDeclaration}
              className="rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase tracking-wider gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Statement"}
            </Button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Postgraduate researchers can include this transparent declaration in Chapter 3 (Methodology) or Appendix to fulfill departmental AI disclosure requirements:
          </p>
          <div className="p-4 bg-white dark:bg-black border border-black dark:border-zinc-800 font-serif text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
            "{sampleDeclaration}"
          </div>
        </div>

        {/* Supervisor Verification Portal Info */}
        <div className="p-6 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>For Supervisors &amp; Doctoral Committees</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">How to verify a student's WriteWise research receipt</h2>
          <p className="text-xs leading-relaxed opacity-90">
            If a student provided you with a WriteWise verification link (<code className="bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black px-1.5 py-0.5 font-mono">https://writewise.duckdns.org/verify/[token]</code>), you can view the complete cryptographic receipt without creating an account. The receipt includes the dataset fingerprint, tests executed, SPSS reproduction syntax, and timestamped Python calculation logs.
          </p>
          <div className="pt-2">
            <Link to="/verify">
              <Button className="rounded-none bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider">
                Look up a Verification Receipt →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
