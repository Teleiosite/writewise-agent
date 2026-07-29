import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Cpu, Code2, FileCheck, Terminal, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Features() {
  const features = [
    {
      title: "Deterministic Python Compute Engine",
      description: "SciPy & Pandas calculate exact frequencies, descriptives, Cronbach's Alpha, Pearson r, and linear regression. Zero LLM numeric guesswork.",
      icon: Cpu,
      badge: "Statistical Core"
    },
    {
      title: "Automatic SPSS Syntax Generation",
      description: "Generates copyable SPSS syntax matching your dataset parameters so supervisors can reproduce identical outputs with 1 click.",
      icon: Code2,
      badge: "Reproducibility"
    },
    {
      title: "Chapter 4 & 5 Academic Narrative",
      description: "AI model interprets only verified statistical outputs to generate structured Results & Discussion chapters.",
      icon: FileCheck,
      badge: "Drafting Engine"
    },
    {
      title: "Dataset SHA-256 Authentication",
      description: "Client-side Web Crypto fingerprinting creates an immutable record linking your raw dataset to your outputs.",
      icon: Terminal,
      badge: "Audit Layer"
    },
    {
      title: "Citation & Reference Workstation",
      description: "Manage references, format in APA, MLA, Chicago, and Harvard, and seamlessly integrate into your chapter drafts.",
      icon: BookOpen,
      badge: "Literature Engine"
    },
    {
      title: "Append-Only Event Provenance Log",
      description: "Every research action is logged in an immutable event stream, providing complete audit trails for ethics committees.",
      icon: ShieldCheck,
      badge: "Trust Infrastructure"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mono-badge-outline mb-4">Platform Capabilities</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Research tools built for <span className="font-serif-italic font-normal">integrity</span>
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mb-16">
            WriteWise combines statistical computation, automated SPSS syntax, transparent AI assistance, and cryptographic dataset verification.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-8 border border-black dark:border-zinc-800 bg-white dark:bg-black flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 border border-black dark:border-zinc-800 flex items-center justify-center font-mono">
                      <feature.icon className="w-5 h-5 text-black dark:text-white" />
                    </div>
                    <span className="mono-badge-outline text-[10px]">{feature.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-black dark:text-white">{feature.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to run your first verified analysis?</h2>
              <p className="text-xs opacity-80 max-w-lg">Upload your dataset, execute Python statistics, and export SPSS syntax in under 3 minutes.</p>
            </div>
            <Link to="/register">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider rounded-none px-6 h-12">
                Start Free Analysis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
