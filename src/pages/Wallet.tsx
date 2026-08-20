import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, CheckCircle2, Zap, CreditCard, Sparkles, Building2, Key } from "lucide-react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Link } from "react-router-dom";

export default function Wallet() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      toast({
        title: "Pro Subscription Checkout",
        description: "Direct Stripe payment processing is being finalized. Contact support for instant institutional invoice access.",
      });
    }, 600);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-4xl mx-auto py-6 font-sans space-y-6">
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Subscription & Compute</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">
            Workspace Plan & AI Compute
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your research subscription, statistical compute limits, and AI provider routing.
          </p>
        </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none">
            <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-mono uppercase font-bold text-black dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Active Plan: Research Starter
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                    Complimentary tier for individual postgraduates
                  </CardDescription>
                </div>
                <span className="mono-badge">FREE FOREVER</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="text-zinc-500 uppercase text-[10px] mb-1">Monthly Statistical Runs</div>
                  <div className="text-xl font-bold text-black dark:text-white">3 / 3 Available</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Full Python execution + SPSS syntax</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="text-zinc-500 uppercase text-[10px] mb-1">Default AI Compute Engine</div>
                  <div className="text-xl font-bold text-black dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Google Gemini
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Included free · Zero configuration</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-mono text-xs uppercase font-bold text-zinc-500">Starter Plan Entitlements:</div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                  <span>Deterministic Python SciPy & Pandas calculations (zero LLM math guesswork)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                  <span>Automatic SPSS syntax code generator (.sps export)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                  <span>Public Supervisor Verification Link generation with SHA-256 fingerprint</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                  <span>Chapter 1–5 academic manuscript drafting workspace</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <Link to="/settings" className="text-xs font-mono underline hover:text-black dark:hover:text-white text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Key className="w-3 h-3" /> Configure Custom Model API Keys (Claude / GPT-4o)
              </Link>
              <Button 
                onClick={handleUpgradeClick}
                disabled={isUpgrading}
                className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider px-6 border border-black dark:border-white"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Upgrade to Pro ($19/mo)
              </Button>
            </CardFooter>
          </Card>

          {/* Pro & Department Upgrade Card */}
          <Card className="rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-none font-sans flex flex-col justify-between">
            <CardHeader className="border-b border-zinc-800 dark:border-zinc-200">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Dissertation Pro</span>
              <CardTitle className="text-xl font-extrabold tracking-tight mt-1">Researcher Pro</CardTitle>
              <div className="font-mono mt-2">
                <span className="text-3xl font-extrabold">$19</span>
                <span className="text-xs opacity-70 ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Unlimited statistical analyses & syntax exports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Academic DOCX & publication-formatted tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Multi-AI model routing (Claude 3.5 Sonnet, GPT-4o)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Permanent supervisor verification archive</span>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-zinc-800 dark:border-zinc-200">
              <Button 
                onClick={handleUpgradeClick}
                className="w-full rounded-none bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider"
              >
                Upgrade Workspace
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Institutional & Department Licensing */}
        <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
          <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase font-bold text-black dark:text-white">
              <Building2 className="h-4 w-4" />
              University & Department Site Licenses
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
              For academic faculties, research labs, and doctoral schools ($499/mo)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Institutional licenses include central supervisor verification dashboards, department dissertation template enforcement, batch SPSS/R syntax export, and formal Data Processing Agreements (GDPR/FERPA compliant).
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="mailto:hello@writewise.app?subject=University%20Department%20License%20Enquiry">
                <Button variant="outline" className="rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase">
                  Request Department Invoice & Onboarding
                </Button>
              </a>
              <Link to="/contact">
                <Button variant="ghost" className="font-mono text-xs uppercase text-zinc-600 dark:text-zinc-400">
                  Speak with Academic Specialist →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeLayout>
  );
}
