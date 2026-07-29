import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { 
  FlaskConical, CheckCircle2, ShieldCheck, Cpu, Code2, FileCheck, 
  ArrowRight, Sparkles, BookOpen, Layers, Lock, Award, Users, ChevronRight, HelpCircle
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"features" | "comparison" | "pricing">("features");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#comparison" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Why WriteWise</a>
              <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/70 via-transparent to-transparent dark:from-blue-950/40 dark:via-transparent dark:to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold accent-badge mb-6 animate-fade-in">
            <ShieldCheck className="w-4 h-4" />
            <span>The Academic Integrity Layer for AI-Assisted Research</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]">
            Research You Can Defend. <br className="hidden sm:inline" />
            <span className="brand-gradient-text">Results Supervisors Can Verify.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            WriteWise computes statistics in <strong className="font-semibold text-slate-900 dark:text-white">Python</strong> with 100% accuracy, generates reproducible <strong className="font-semibold text-slate-900 dark:text-white">SPSS syntax</strong>, and uses AI strictly to interpret verified outputs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 shadow-lg shadow-blue-600/25">
                Start Your First Analysis Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 font-semibold border-slate-300 dark:border-slate-700">
                <FlaskConical className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                Launch Demo Workspace
              </Button>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-3 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                Python Engine
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">100% accurate SciPy & Pandas calculations</p>
            </div>
            <div className="p-3 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                SPSS Syntax
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Independent 1-click supervisor verification</p>
            </div>
            <div className="p-3 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Chapter 4 & 5
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Structured academic narrative from verified data</p>
            </div>
            <div className="p-3 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                Audit Provenance
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Immutable record of data and computation</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Distinction Callout */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why Other AI Tools Fail in Academic Settings
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            Generative AI models hallucinate numbers, round inconsistently, and fabricate statistical significance. Submitting AI-generated statistics can fail a dissertation defence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-red-500/30 relative">
              <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold mb-3">
                Other AI Essay Writers
              </span>
              <h3 className="text-lg font-bold mb-2 text-white">LLM-Generated Numbers</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  AI guesses statistical values (mean, p-value, r-value)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  Unverifiable numbers that fail supervisor inspection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  Promotes academic dishonesty & violates IRB policies
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-blue-500/50 relative shadow-xl shadow-blue-500/10">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold mb-3">
                The WriteWise Engine
              </span>
              <h3 className="text-lg font-bold mb-2 text-white">Python Compute + AI Explanation</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Python (Pandas + SciPy) executes exact computations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Generates downloadable SPSS syntax for supervisor verification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  AI only receives verified outputs to write Chapter 4 & 5
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            How WriteWise Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From raw survey data to publishable, verifiable dissertation chapters in 5 clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { step: "01", title: "Upload Dataset", desc: "Excel (.xlsx), CSV, or SPSS (.sav) data files parsed client-side." },
            { step: "02", title: "Configure Variables", desc: "Set nominal, ordinal, or scale variables and assign IV/DV roles." },
            { step: "03", title: "Python Computes", desc: "SciPy computes exact descriptives, correlation, reliability, and regression." },
            { step: "04", title: "SPSS Syntax Generated", desc: "Export syntax matching your data so your supervisor can reproduce results." },
            { step: "05", title: "AI Narrates Chapter", desc: "Selected AI model writes Chapter 4 & 5 using ONLY verified statistical data." }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2 block">{item.step}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
              WriteWise vs Existing Academic Tools
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              How WriteWise compares to general tools in the academic workflow.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Capability</th>
                  <th className="p-4 font-bold text-blue-600 dark:text-blue-400">WriteWise</th>
                  <th className="p-4 font-medium text-slate-600 dark:text-slate-400">ChatGPT</th>
                  <th className="p-4 font-medium text-slate-600 dark:text-slate-400">SPSS</th>
                  <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Grammarly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { name: "Deterministic Stats Computation", ww: true, gpt: false, spss: true, gram: false },
                  { name: "Automatic SPSS Syntax Output", ww: true, gpt: false, spss: true, gram: false },
                  { name: "Chapter 4 & 5 Generation", ww: true, gpt: true, spss: false, gram: false },
                  { name: "Dataset SHA-256 Authentication", ww: true, gpt: false, spss: false, gram: false },
                  { name: "Proven Data-to-Narrative Separation", ww: true, gpt: false, spss: false, gram: false },
                  { name: "Supervisor Share Link", ww: true, gpt: false, spss: false, gram: false },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-4 text-blue-600 font-bold">{row.ww ? "✓ Yes" : "—"}</td>
                    <td className="p-4 text-slate-500">{row.gpt ? "Partial" : "× No"}</td>
                    <td className="p-4 text-slate-500">{row.spss ? "✓ Yes" : "× No"}</td>
                    <td className="p-4 text-slate-500">{row.gram ? "✓ Yes" : "× No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Simple, Analysis-Based Pricing
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We price on research analyses completed — not word counts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Research Starter",
              price: "$0",
              period: "Free forever",
              desc: "Perfect for exploring your first dataset",
              features: [
                "3 statistical analyses / month",
                "Full Python compute engine",
                "SPSS syntax generation",
                "Chapter 4 & 5 drafting",
                "Standard citation manager"
              ],
              cta: "Start Free",
              popular: false
            },
            {
              name: "Researcher Pro",
              price: "$19",
              period: "per month",
              desc: "For Master's & PhD researchers completing dissertations",
              features: [
                "Unlimited statistical analyses",
                "Multi-model AI router (Claude, GPT-4o, Gemini)",
                "DOCX & PDF Academic export",
                "Dataset SHA-256 Authentication",
                "Supervisor verification share links",
                "Priority support"
              ],
              cta: "Get Pro Access",
              popular: true
            },
            {
              name: "Department License",
              price: "$149",
              period: "per month",
              desc: "For research groups, faculties & university departments",
              features: [
                "Includes 10 researcher seats",
                "Supervisor audit dashboard",
                "Batch SPSS & R syntax export",
                "Custom institution templates",
                "GDPR & Data processing agreement",
                "Dedicated onboarding"
              ],
              cta: "Contact Department Sales",
              popular: false
            }
          ].map((plan, i) => (
            <div key={i} className={`rounded-2xl p-8 flex flex-col justify-between border ${plan.popular ? "border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 relative" : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"}`}>
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  Recommended for Postgrads
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className={`w-full font-semibold ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} WriteWise Agent. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
