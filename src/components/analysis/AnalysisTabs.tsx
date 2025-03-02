
import { Button } from "@/components/ui/button";
import { PenTool, BookOpen, FileText } from "lucide-react";

interface AnalysisTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading: boolean;
}

export function AnalysisTabs({ activeTab, onTabChange, isLoading }: AnalysisTabsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={activeTab === "writing" ? "default" : "outline"}
        size="sm"
        onClick={() => onTabChange("writing")}
        disabled={isLoading}
      >
        <PenTool className="w-4 h-4 mr-1" />
        Writing
      </Button>
      <Button
        variant={activeTab === "grammar" ? "default" : "outline"}
        size="sm"
        onClick={() => onTabChange("grammar")}
        disabled={isLoading}
      >
        <BookOpen className="w-4 h-4 mr-1" />
        Grammar
      </Button>
      <Button
        variant={activeTab === "generate" ? "default" : "outline"}
        size="sm"
        onClick={() => onTabChange("generate")}
        disabled={isLoading}
      >
        <FileText className="w-4 h-4 mr-1" />
        Generate
      </Button>
    </div>
  );
}
