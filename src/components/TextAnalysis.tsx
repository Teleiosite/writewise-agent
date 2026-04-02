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
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <AnalysisTabs 
            activeTab={analysisTab} 
            onTabChange={toggleAnalysisPanel} 
            isLoading={isLoading}
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
            onClick={() => toggleAnalysisPanel()}
            title="Close Analysis Panel"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
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
