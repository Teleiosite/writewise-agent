import { useState, useEffect } from "react";
import { X, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("hasSeenWelcomeBanner");
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);
  
  const dismissBanner = () => {
    localStorage.setItem("hasSeenWelcomeBanner", "true");
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="relative bg-black text-white dark:bg-white dark:text-black p-6 rounded-none border border-black dark:border-white shadow-none mb-6 font-sans">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-3 right-3 text-zinc-400 hover:text-white dark:hover:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200" 
        onClick={dismissBanner}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="mono-badge mb-3 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black border-none">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Academic Research Operating System</span>
      </div>

      <h3 className="font-extrabold text-xl mb-2 tracking-tight">
        Welcome to WriteWise Workspace
      </h3>

      <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-700 max-w-2xl leading-relaxed mb-4">
        Your academic workstation powered by 100% deterministic Python statistics (SciPy/Pandas), automatic SPSS syntax generation, and transparent AI narrative drafting for Chapters 4 & 5.
      </p>

      <div className="flex items-center gap-3">
        <Button 
          size="sm" 
          className="bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider rounded-none px-4"
          onClick={() => { dismissBanner(); navigate('/data-analysis'); }}
        >
          Run First Analysis <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
        <Button 
          variant="outline"
          size="sm" 
          className="border-zinc-700 dark:border-zinc-300 bg-transparent text-white dark:text-black font-mono text-xs uppercase tracking-wider rounded-none hover:bg-zinc-900 dark:hover:bg-zinc-100"
          onClick={dismissBanner}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
