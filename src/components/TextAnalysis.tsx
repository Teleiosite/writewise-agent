import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool, X } from "lucide-react";
import { AnalysisTabs } from "./analysis/AnalysisTabs";
import { WritingSuggestions } from "./analysis/WritingSuggestions";
import { GrammarAnalysis } from "./analysis/GrammarAnalysis";
import { ContentGenerator } from "./analysis/ContentGenerator";
import { useEditor } from "@/contexts/editor";

export function TextAnalysis() {
  const [isLoading] = useState(false);
  const { 
    getCurrentSectionContent, 
    addContentToActiveSection,
    analysisTab,
    toggleAnalysisPanel
  } = useEditor();
  
  const content = getCurrentSectionContent();

  return (
    <Card className="p-4 relative rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-3 left-3 h-7 w-7 rounded-none text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 z-10"
        onClick={() => toggleAnalysisPanel()}
        title="Close Panel"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-black dark:border-zinc-800 pl-8 font-mono">
        <div className="flex items-center space-x-2">
          <PenTool className="h-4 w-4 text-black dark:text-white" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">AI Analysis & Guidance</h3>
        </div>
        <div className="flex items-center">
          <AnalysisTabs 
            activeTab={analysisTab} 
            onTabChange={toggleAnalysisPanel} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-2">
        <div className="pb-8">
          {analysisTab === "writing" && (
            <WritingSuggestions 
              content={content}
              onSuggestionClick={addContentToActiveSection}
            />
          )}
          
          {analysisTab === "grammar" && (
            <GrammarAnalysis 
              content={content}
            />
          )}
          
          {analysisTab === "generate" && (
            <ContentGenerator 
              onSuggestionClick={addContentToActiveSection}
            />
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
