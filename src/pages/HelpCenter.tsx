import { useState } from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FlaskConical, BookOpen, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      title: "Data Analysis & Python Engine",
      description: "Deterministic SciPy/Pandas execution & codebook config",
      icon: <FlaskConical className="h-5 w-5 text-black dark:text-white" />,
      topics: [
        "Uploading CSV, Excel, and SPSS (.sav) files",
        "Configuring Independent/Dependent variable roles",
        "Executing correlation, regression, & ANOVA tests",
        "Exporting SPSS syntax files for supervisor submission"
      ]
    },
    {
      title: "Chapter 4 & 5 Narrative Generator",
      description: "Grounding AI interpretation in scientific empirical facts",
      icon: <BookOpen className="h-5 w-5 text-black dark:text-white" />,
      topics: [
        "Setting research context & domain hypotheses",
        "Inserting statistical narratives directly to workspace canvas",
        "Verifying effect sizes and p-values in narrative text",
        "Exporting formatted APA tables to DOCX"
      ]
    },
    {
      title: "API Keys & Custom Engine",
      description: "Connecting OpenAI, Gemini, Claude, or DeepSeek credentials",
      icon: <Cpu className="h-5 w-5 text-black dark:text-white" />,
      topics: [
        "Obtaining a Google Gemini or OpenAI API key",
        "Testing connection latency & provider limits",
        "Zero-log browser localStorage key storage",
        "Configuring fallback Pollinations execution"
      ]
    },
    {
      title: "Academic Integrity & Audit Trails",
      description: "Provenance logs and reproducibility receipts",
      icon: <ShieldCheck className="h-5 w-5 text-black dark:text-white" />,
      topics: [
        "Understanding SHA-256 client-side dataset hashing",
        "Downloading append-only audit event logs",
        "Demonstrating statistical reproducibility to committee",
        "Exporting verification receipts"
      ]
    }
  ];

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-4xl mx-auto py-6 font-sans space-y-8">
        <div className="text-center border-b border-black dark:border-zinc-800 pb-8">
          <span className="mono-badge mb-3">Knowledge Base & Documentation</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1">Research Engine Help Center</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Guides, dataset preparation rules, and technical specifications for WriteWise statistical analysis engine.
          </p>
          
          <div className="mt-6 max-w-lg mx-auto font-mono">
            <div className="flex gap-2">
              <Input 
                placeholder="Search research docs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <Button className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-6 border border-black dark:border-white">
                Search
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpCategories.map((category, index) => (
            <Card key={index} className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center font-mono">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-black dark:text-white uppercase font-mono">{category.title}</CardTitle>
                    <CardDescription className="text-[11px] text-zinc-600 dark:text-zinc-400">{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 font-mono text-xs">
                <ul className="space-y-2">
                  {category.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer group">
                      <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                      <span className="group-hover:underline">{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-6 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-center font-sans">
          <h3 className="font-bold text-sm text-black dark:text-white uppercase font-mono mb-1">Need Direct Technical Consultation?</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 max-w-md mx-auto">
            Our research engineering team is available to assist with custom dataset structures or SPSS syntax issues.
          </p>
          <Button variant="outline" className="rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase px-6" asChild>
            <a href="/contact-support">Open Support Ticket</a>
          </Button>
        </div>
      </div>
    </HomeLayout>
  );
}
