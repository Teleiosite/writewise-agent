import { Button } from "@/components/ui/button";
import { 
  PenTool, 
  BookOpen, 
  FileText, 
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
      case "generate": return <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />;
      default: return <Zap className="w-3.5 h-3.5 mr-2" />;
    }
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 flex items-center gap-1 border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-95 px-2.5 rounded-xl shadow-sm"
            disabled={isLoading}
          >
            <div className="flex items-center text-xs font-bold text-gray-700 dark:text-gray-300">
              {getActiveIcon()}
              <span className="mr-1">{getActiveLabel()}</span>
            </div>
            <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <ChevronDown className="w-2.5 h-2.5 text-gray-400 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 shadow-xl border-gray-100 dark:border-gray-800 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Select AI Mode</div>
          
          <DropdownMenuItem 
            onClick={() => onTabChange("writing")}
            className={`flex items-center py-2.5 cursor-pointer rounded-lg ${activeTab === "writing" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold" : ""}`}
          >
            <PenTool className="w-4 h-4 mr-2.5 opacity-70" />
            <span className="text-sm">Writing Suggestions</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onTabChange("grammar")}
            className={`flex items-center py-2.5 cursor-pointer rounded-lg ${activeTab === "grammar" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold" : ""}`}
          >
            <Zap className="w-4 h-4 mr-2.5 opacity-70 text-orange-500" />
            <span className="text-sm">Grammar Analysis</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onTabChange("generate")}
            className={`flex items-center py-2.5 cursor-pointer rounded-lg ${activeTab === "generate" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold" : ""}`}
          >
            <Sparkles className="w-4 h-4 mr-2.5 opacity-70 text-blue-500" />
            <span className="text-sm">Generate Sections</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
