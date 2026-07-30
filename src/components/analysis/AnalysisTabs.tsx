import { Button } from "@/components/ui/button";
import { 
  PenTool, 
  BookOpen, 
  MoreHorizontal, 
  ChevronDown,
  Sparkles,
  Zap
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface AnalysisTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading: boolean;
}

export function AnalysisTabs({ activeTab, onTabChange, isLoading }: AnalysisTabsProps) {
  const getActiveLabel = () => {
    switch(activeTab) {
      case "writing": return "Writing";
      case "grammar": return "Grammar";
      case "generate": return "Generate";
      default: return "AI Mode";
    }
  };

  const getActiveIcon = () => {
    switch(activeTab) {
      case "writing": return <PenTool className="w-3.5 h-3.5 mr-2" />;
      case "grammar": return <BookOpen className="w-3.5 h-3.5 mr-2" />;
      case "generate": return <Sparkles className="w-3.5 h-3.5 mr-2 text-black dark:text-white" />;
      default: return <Zap className="w-3.5 h-3.5 mr-2" />;
    }
  };

  return (
    <div className="flex items-center font-sans">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 flex items-center gap-1 border border-black dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3 rounded-none shadow-none font-mono text-xs"
            disabled={isLoading}
          >
            <div className="flex items-center text-xs font-bold text-black dark:text-white">
              {getActiveIcon()}
              <span className="mr-1 uppercase tracking-wider">{getActiveLabel()}</span>
            </div>
            <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 border border-black dark:border-zinc-800 bg-white dark:bg-black rounded-none p-1 font-mono text-xs shadow-none">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select AI Mode</div>
          
          <DropdownMenuItem 
            onClick={() => onTabChange("writing")}
            className={`flex items-center py-2 cursor-pointer rounded-none ${activeTab === "writing" ? "bg-black text-white dark:bg-white dark:text-black font-bold" : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <PenTool className="w-3.5 h-3.5 mr-2" />
            <span className="text-xs uppercase tracking-wider">Writing Guidance</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onTabChange("grammar")}
            className={`flex items-center py-2 cursor-pointer rounded-none ${activeTab === "grammar" ? "bg-black text-white dark:bg-white dark:text-black font-bold" : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Zap className="w-3.5 h-3.5 mr-2" />
            <span className="text-xs uppercase tracking-wider">Academic Syntax</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onTabChange("generate")}
            className={`flex items-center py-2 cursor-pointer rounded-none ${activeTab === "generate" ? "bg-black text-white dark:bg-white dark:text-black font-bold" : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            <span className="text-xs uppercase tracking-wider">Generate Sections</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
