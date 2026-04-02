import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool } from "lucide-react";
import { AnalysisTabs } from "./analysis/AnalysisTabs";
import { WritingSuggestions } from "./analysis/WritingSuggestions";
import { GrammarAnalysis } from "./analysis/GrammarAnalysis";
import { ContentGenerator } from "./analysis/ContentGenerator";
import { useEditor } from "@/contexts/editor";

export function TextAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    getCurrentSectionContent, 
    addContentToActiveSection,
    analysisTab,
    toggleAnalysisPanel
  } = useEditor();
  
  const content = getCurrentSectionContent();

  return (
    <Card className="p-4 relative overflow-hidden group/analysis">
      {/* Absolute Close Button moved to left corner based on user feedback */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 left-2 h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 z-10 opacity-60 hover:opacity-100 transition-all active:scale-90"
        onClick={() => toggleAnalysisPanel()}
        title="Close Analysis Panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>

      <div className="flex items-center justify-between mb-4 pb-2 border-b pl-7">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <div className="flex items-center mr-6">
          <AnalysisTabs 
            activeTab={analysisTab} 
            onTabChange={toggleAnalysisPanel} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-3">
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
