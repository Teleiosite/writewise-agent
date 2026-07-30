import { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Code2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboardingWizard");
    if (!hasCompletedOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem("hasCompletedOnboardingWizard", "true");
    setOpen(false);
  };

  const handleStartAnalysis = () => {
    handleFinish();
    navigate("/data-analysis");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden">
        {/* Header Bar */}
        <div className="bg-black text-white dark:bg-white dark:text-black p-4 flex items-center justify-between border-b border-black dark:border-white font-mono text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Academic Onboarding</span>
          </div>
          <span className="font-bold">STEP 0{step} / 03</span>
        </div>

        {/* Step 1: Core Philosophy */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="mono-badge">
              <span>01 / Architecture</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
              Python computes the statistics. <br />
              AI writes the <span className="font-serif-italic font-normal">narrative</span>.
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              Generative AI models hallucinate figures when asked to calculate statistics directly. WriteWise uses 100% deterministic Python (Pandas &amp; SciPy) for computation. AI models only receive verified numeric tables to write Chapter 4 &amp; 5 narrative drafts.
            </p>

            <div className="p-4 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                <Cpu className="w-4 h-4" />
                <span>Deterministic Computation Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Zero numeric guesswork. Every p-value, mean, standard deviation, and r-score is calculated before LLM prompting.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-black dark:border-zinc-800">
              <Button 
                onClick={() => setStep(2)}
                className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider h-10 px-6 rounded-none border border-black dark:border-white"
              >
                Next: SPSS Reproducibility <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: SPSS Syntax & Verification */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="mono-badge">
              <span>02 / Reproducibility</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
              Copyable SPSS syntax for <br />
              <span className="font-serif-italic font-normal">1-click supervisor verification</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              Every statistical output generated in WriteWise provides identical IBM SPSS syntax matching your exact variable names. Your supervisor or ethics committee can execute the code to verify your thesis outputs.
            </p>

            <div className="p-4 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                <Code2 className="w-4 h-4" />
                <span>SPSS Syntax Output</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Supports Descriptive Statistics, Reliability (Cronbach's Alpha), Pearson Correlation, Linear Regression, and ANOVA.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-black dark:border-zinc-800">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="font-mono text-xs uppercase tracking-wider h-10 px-4 rounded-none border-black dark:border-zinc-800"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider h-10 px-6 rounded-none border border-black dark:border-white"
              >
                Next: Launch Mode <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Launch Choice */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div className="mono-badge">
              <span>03 / Ready</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
              Where would you like to <span className="font-serif-italic font-normal">start</span>?
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              Choose your primary workflow. You can switch between tools anytime from your workspace menu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleStartAnalysis}
                className="p-5 text-left border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono space-y-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">Data Engine</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-[11px] opacity-80 font-sans">
                  Upload dataset, run Python stats, generate SPSS syntax &amp; Chapter 4/5 draft.
                </p>
              </button>

              <button
                onClick={handleFinish}
                className="p-5 text-left border border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white font-mono space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">Manuscript Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans">
                  Open MS Word-style academic editor, citation manager, and PDF reader.
                </p>
              </button>
            </div>

            <div className="flex justify-start pt-2">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="font-mono text-xs uppercase tracking-wider h-9 px-4 rounded-none border-black dark:border-zinc-800"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
