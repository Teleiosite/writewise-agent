import { Navigation } from "@/components/layout/Navigation";
import { ClaimVerificationPanel } from "@/components/analysis/ClaimVerificationPanel";
import { ShieldCheck, ArrowLeft, FlaskConical, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ClaimAuditorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navigation />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-10">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white gap-1.5 p-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <Link to="/data-analysis">
            <Button 
              variant="outline" 
              size="sm"
              className="font-mono text-xs uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" /> Go to Full Data Engine
            </Button>
          </Link>
        </div>

        {/* Page Hero */}
        <div className="mb-8 border border-black dark:border-white p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-950 font-mono">
          <div className="flex items-center gap-2 mb-2">
            <span className="mono-badge bg-black text-white dark:bg-white dark:text-black border-none">
              INSTITUTIONAL INTEGRITY ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight font-sans">
            Chapter Claim Verification Auditor
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            Paste your written Chapter 4 (Results) or Chapter 5 (Discussion) draft text below. WriteWise extracts statistical claims ($r$-values, $p$-values, Cronbach's Alpha $\alpha$, means $M$) and verifies every figure against deterministic computation standards.
          </p>
        </div>

        {/* Dedicated Claim Auditor Panel Component */}
        <div className="border border-black dark:border-zinc-800 p-6 sm:p-8 bg-white dark:bg-black">
          <ClaimVerificationPanel />
        </div>
      </main>
    </div>
  );
}
