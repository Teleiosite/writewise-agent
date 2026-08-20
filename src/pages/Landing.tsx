import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { 
  ArrowRight, ShieldCheck, Cpu, Code2, FileCheck, CheckCircle2, 
  FlaskConical, Terminal, ExternalLink, Scale, Check, X, Sparkles, BookOpen, Key
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-zinc-600 dark:text-zinc-400">
              <a href="#manifesto" className="hover:text-black dark:hover:text-white transition-colors">Manifesto</a>
              <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</a>
              <a href="#comparison" className="hover:text-black dark:hover:text-white transition-colors">Comparison</a>
              <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-4 rounded-none border border-black dark:border-white">
                Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 border-b border-black dark:border-zinc-800 bg-grid-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-left">
          
          <div className="mono-badge mb-8 inline-flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>Academic Research &amp; Verification Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black dark:text-white mb-8 leading-[1.05]">
            Research you can defend. <br />
            Results supervisors can <span className="font-serif-italic font-normal">verify</span>.
          </h1>

          <p className="text-lg sm:text-2xl text-zinc-700 dark:text-zinc-300 max-w-3xl mb-12 font-normal leading-relaxed">
            WriteWise executes statistical analysis in <strong className="font-semibold text-black dark:text-white underline underline-offset-4">Python</strong> — exactly as Python computes it, never estimated by AI. Generates reproducible <strong className="font-semibold text-black dark:text-white underline underline-offset-4">SPSS syntax</strong> and uses AI strictly to explain verified outputs.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
            <Link to="/register">
              <Button size="lg" className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-widest h-14 px-8 rounded-none border border-black dark:border-white shadow-none">
                Start Your First Analysis Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="font-mono text-xs uppercase tracking-widest h-14 px-8 rounded-none border border-black dark:border-zinc-700 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-full sm:w-auto">
                <FlaskConical className="w-4 h-4 mr-2" />
                See How It Works
              </Button>
            </a>
          </div>

          {/* Product UI Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="border border-black dark:border-zinc-800 overflow-hidden bg-white dark:bg-black shadow-sm">
              <div className="px-4 py-2.5 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>01 / Statistical Workspace</span>
                <span className="text-black dark:text-white font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> PYTHON ENGINE
                </span>
              </div>
              <img
                src="/screenshot-dashboard.png"
                alt="WriteWise statistical analysis workspace showing Python-computed regression results, APA 7th tables, and SPSS syntax"
                className="w-full object-cover object-top h-[320px] sm:h-[380px]"
                loading="lazy"
              />
            </div>
            <div className="border border-black dark:border-zinc-800 overflow-hidden bg-white dark:bg-black shadow-sm">
              <div className="px-4 py-2.5 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>02 / Supervisor Verification Portal</span>
                <span className="text-black dark:text-white font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> 1-CLICK PUBLIC LINK
                </span>
              </div>
              <img
                src="/screenshot-verify.png"
                alt="WriteWise supervisor verification portal showing dataset SHA-256 fingerprint, tests run, and SPSS reproducibility syntax"
                className="w-full object-cover object-top h-[320px] sm:h-[380px]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Technical Specs Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0 border border-black dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-black dark:divide-zinc-800 bg-white dark:bg-black">
            <div className="p-6">
              <div className="font-mono text-xs text-zinc-500 mb-2 uppercase">01 / Engine</div>
              <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Python SciPy &amp; Pandas
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">Deterministic stats computation — zero LLM numeric guesswork.</p>
            </div>
            <div className="p-6">
              <div className="font-mono text-xs text-zinc-500 mb-2 uppercase">02 / Syntax</div>
              <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4" /> SPSS Code Generator
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">Downloadable syntax for 1-click supervisor reproduction.</p>
            </div>
            <div className="p-6">
              <div className="font-mono text-xs text-zinc-500 mb-2 uppercase">03 / Output</div>
              <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Chapter 4 &amp; 5 Narrative
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">Structured prose generated exclusively from verified numbers.</p>
            </div>
            <div className="p-6">
              <div className="font-mono text-xs text-zinc-500 mb-2 uppercase">04 / Trust</div>
              <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4" /> SHA-256 Authentication
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">Client-side dataset hashing for immutable audit trails.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-20 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="mono-badge-outline mb-6">Academic Manifesto</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">
            Designed to be shown to supervisors — <span className="font-serif-italic font-normal">not hidden from them.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-800 dark:text-zinc-200">
            <div className="space-y-4 text-sm leading-relaxed">
              <p className="font-semibold text-black dark:text-white">
                Submitting LLM-generated statistical figures to a dissertation supervisor is an existential academic risk.
              </p>
              <p>
                Generative AI models hallucinate means, round inconsistently, and fabricate statistical significance. If an AI writes that your p-value is 0.03 when the dataset actually yields 0.08, your research is compromised.
              </p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed border-l-2 border-black dark:border-white pl-6">
              <p className="font-semibold text-black dark:text-white">
                WriteWise enforces strict technical separation between data computation and narrative generation.
              </p>
              <p>
                Python handles the math. The AI model only receives structured JSON statistical results — never raw participant rows. Every generated table includes reproducible SPSS syntax so any supervisor can verify every claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow */}
      <section id="how-it-works" className="py-24 border-b border-black dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="mono-badge-outline mb-4">Pipeline</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 tracking-tight">
            From raw data to <span className="font-serif-italic font-normal">verifiable</span> chapters
          </h2>

          <div className="space-y-0 border-t border-b border-black dark:border-zinc-800 divide-y divide-black dark:divide-zinc-800">
            {[
              { num: "01", title: "Dataset Ingestion & Client-Side Hashing", desc: "Upload Excel (.xlsx), CSV, or SPSS (.sav) data. SHA-256 cryptographic fingerprint computed in browser." },
              { num: "02", title: "Codebook & Variable Role Assignment", desc: "Define nominal, ordinal, or scale variables and designate IV/DV research roles." },
              { num: "03", title: "Deterministic Python Computation", desc: "SciPy computes exact descriptives, Cronbach's Alpha, Pearson correlation, and linear regression." },
              { num: "04", title: "SPSS Syntax Code Export", desc: "Download exact SPSS syntax matching your analysis for 1-click supervisor verification." },
              { num: "05", title: "AI Academic Narrative Stream", desc: "Selected AI model writes Chapter 4 (Results) & Chapter 5 (Discussion) using ONLY verified outputs." }
            ].map((step, i) => (
              <div key={i} className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors px-4">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xl font-bold text-zinc-400 dark:text-zinc-600">{step.num}</span>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">{step.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">{step.desc}</p>
                  </div>
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 shrink-0">Automated Pipeline</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Comparison Table */}
      <section id="comparison" className="py-24 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="mono-badge-outline mb-4">Architectural Comparison</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 tracking-tight">
            How WriteWise compares across academic tools
          </h2>

          <div className="border border-black dark:border-zinc-800 overflow-x-auto bg-white dark:bg-black">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-black dark:border-zinc-800 bg-black text-white dark:bg-white dark:text-black font-mono uppercase tracking-wider">
                  <th className="p-4">Capability</th>
                  <th className="p-4 bg-zinc-800 dark:bg-zinc-200">WriteWise</th>
                  <th className="p-4">ChatGPT</th>
                  <th className="p-4">IBM SPSS</th>
                  <th className="p-4">Grammarly</th>
                  <th className="p-4">Jenni AI / SciSpace</th>
                  <th className="p-4">Zotero</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black dark:divide-zinc-800 font-mono">
                {[
                  { feature: "Deterministic Stats (Python)", ww: "✓ Exact", gpt: "× Hallucinated", spss: "✓ Exact", gram: "× No", jenni: "× No", zotero: "× No" },
                  { feature: "Reproducible SPSS Syntax Export", ww: "✓ 1-Click", gpt: "× No", spss: "✓ Yes", gram: "× No", jenni: "× No", zotero: "× No" },
                  { feature: "Chapter 4 & 5 Academic Prose", ww: "✓ Verified Stats", gpt: "⚠️ Unverified", spss: "× No", gram: "× No", jenni: "⚠️ Generic", zotero: "× No" },
                  { feature: "Supervisor Verification Link", ww: "✓ Public URL", gpt: "× No", spss: "× No", gram: "× No", jenni: "× No", zotero: "× No" },
                  { feature: "Dataset SHA-256 Fingerprint", ww: "✓ Client-side", gpt: "× No", spss: "× No", gram: "× No", jenni: "× No", zotero: "× No" },
                  { feature: "Citation & Reference Management", ww: "✓ APA / MLA", gpt: "⚠️ Often Fake", spss: "× No", gram: "⚠️ Basic", jenni: "✓ Yes", zotero: "✓ Yes" },
                  { feature: "Default Free AI Compute (No Key Needed)", ww: "✓ Gemini 2.5", gpt: "✓ Tiered", spss: "× No", gram: "✓ Limited", jenni: "✓ Limited", zotero: "✓ Free" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="p-4 font-sans font-semibold text-black dark:text-white">{row.feature}</td>
                    <td className="p-4 font-bold text-black dark:text-white bg-zinc-50 dark:bg-zinc-950">{row.ww}</td>
                    <td className="p-4 text-zinc-400">{row.gpt}</td>
                    <td className="p-4 text-zinc-400">{row.spss}</td>
                    <td className="p-4 text-zinc-400">{row.gram}</td>
                    <td className="p-4 text-zinc-400">{row.jenni}</td>
                    <td className="p-4 text-zinc-400">{row.zotero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="mono-badge-outline mb-4">Pricing</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
          Analysis-based pricing
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-12 max-w-lg">
          Priced on completed statistical analyses — not arbitrary word count limits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Research Starter",
              price: "$0",
              period: "Free forever",
              desc: "For exploring initial dataset analyses",
              features: [
                "3 statistical analyses / month",
                "Default Google Gemini 2.5 Flash compute",
                "Python SciPy compute engine",
                "SPSS syntax generation",
                "Chapter 4 & 5 drafting",
                "APA Citation manager"
              ],
              cta: "Start Free",
              highlight: false
            },
            {
              name: "Researcher Pro",
              price: "$19",
              period: "per month",
              desc: "For Master's & PhD dissertation candidates",
              features: [
                "Unlimited statistical analyses",
                "Multi-AI router (Claude 3.5 Sonnet, GPT-4o)",
                "Academic DOCX & PDF Export",
                "Dataset SHA-256 authentication",
                "Supervisor 1-click verification links",
                "Priority support"
              ],
              cta: "Get Pro Access",
              highlight: true
            },
            {
              name: "Department License",
              price: "$499",
              period: "per month",
              desc: "For university faculties & research departments",
              features: [
                "10 researcher workspace seats",
                "Supervisor verification dashboard",
                "Batch SPSS & R syntax export",
                "Department template enforcement",
                "GDPR & Data Processing agreement",
                "Dedicated onboarding"
              ],
              cta: "Contact Sales",
              highlight: false
            }
          ].map((plan, idx) => (
            <div key={idx} className={`p-8 border flex flex-col justify-between ${plan.highlight ? "border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black" : "border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white"}`}>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider mb-2 opacity-70">Tier {idx + 1}</div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-xs opacity-80 mb-6">{plan.desc}</p>
                <div className="mb-8 font-mono">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-xs ml-1 opacity-70">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to={idx === 2 ? 'mailto:hello@writewise.app?subject=Department%20License%20Enquiry' : '/register'}>
                <Button className={`w-full font-mono text-xs uppercase tracking-wider h-12 rounded-none ${plan.highlight ? 'bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800' : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-zinc-500">© {new Date().getFullYear()} WriteWise Agent. Built for research integrity.</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400">
            <Link to="/privacy" className="hover:text-black dark:hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-black dark:hover:text-white">Terms</Link>
            <Link to="/contact" className="hover:text-black dark:hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
