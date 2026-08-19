import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, FileText, Users, FlaskConical, ShieldCheck, MessageSquareText } from "lucide-react";

interface FeaturesSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onFeatureClick: (feature: string) => void;
}

export function FeaturesSidebar({ mobileMenuOpen, setMobileMenuOpen, onFeatureClick }: FeaturesSidebarProps) {
  const features = [
    {
      name: "AI Data Analysis",
      description: "Python-computed statistics, SPSS syntax generation, and Chapter 4/5 narrative creation.",
      icon: FlaskConical,
      isPrimary: true
    },
    {
      name: "Chapter Claim Auditor",
      description: "Audit Chapter 4 & 5 prose to verify statistical claims against Python engine outputs.",
      icon: ShieldCheck,
      isPrimary: true
    },
    {
      name: "AI-Powered Editor",
      description: "Smart writing workstation with real-time academic grammar and structure guidance.",
      icon: FileText,
      isPrimary: false
    },
    {
      name: "Citation Manager",
      description: "Manage references and citations in APA, MLA, Chicago, and Harvard formats.",
      icon: Users,
      isPrimary: false
    },
    {
      name: "Research Assistant",
      description: "Extract insights, verify literature, and analyze scientific papers with AI.",
      icon: MessageSquareText,
      isPrimary: false
    },
    {
      name: "Read PDF & Chat",
      description: "Import PDFs and interact with your literature directly alongside your canvas.",
      icon: BookOpen,
      isPrimary: false
    }
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 w-64 bg-white dark:bg-black border-r border-black dark:border-zinc-800 z-40 transform transition-transform duration-200 ease-in-out font-sans
      md:static md:w-1/4 md:translate-x-0 md:shadow-none
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-black dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-black dark:text-white" />
            <h2 className="font-bold text-sm tracking-tight uppercase font-mono text-black dark:text-white">Features &amp; Tools</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            &times;
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-2">
          <div className="px-2 space-y-1">
            {features.map((feature) => (
              <button
                key={feature.name}
                onClick={() => onFeatureClick(feature.name)}
                className={`w-full text-left p-3 rounded-none border transition-all group ${
                  feature.isPrimary
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-none"
                    : "border-transparent hover:border-black dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 shrink-0 flex items-center justify-center border text-xs font-mono ${
                    feature.isPrimary
                      ? "bg-white text-black dark:bg-black dark:text-white border-white dark:border-black"
                      : "bg-zinc-100 dark:bg-zinc-900 border-black dark:border-zinc-800 text-black dark:text-white"
                  }`}>
                    <feature.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs mb-1 ${feature.isPrimary ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                      {feature.name}
                    </h3>
                    <p className={`text-[11px] leading-relaxed ${
                      feature.isPrimary 
                        ? "text-zinc-300 dark:text-zinc-700" 
                        : "text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white"
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[10px] text-zinc-500">
          <p className="font-bold text-black dark:text-white uppercase mb-0.5">WRITEWISE INTEGRITY SUITE</p>
          <p>Deterministic stats · APA formatting · Verified claims</p>
        </div>
      </div>
    </div>
  );
}
