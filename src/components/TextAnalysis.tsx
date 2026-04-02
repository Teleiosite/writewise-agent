import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool } from "lucide-react";
import { AnalysisTabs } from "./analysis/AnalysisTabs";
import { WritingSuggestions } from "./analysis/WritingSuggestions";
import { GrammarAnalysis } from "./analysis/GrammarAnalysis";
import { ContentGenerator } from "./analysis/ContentGenerator";
import { useEditor } from "@/contexts/editor";

export function TextAnalysis() {
  const { 
    getCurrentSectionContent, 
    addContentToActiveSection, 
    activeAiTab, 
    setActiveAiTab 
  } = useEditor();
  
  const [isLoading, setIsLoading] = useState(false);
  const content = getCurrentSectionContent();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <AnalysisTabs 
          activeTab={activeAiTab} 
          onTabChange={setActiveAiTab} 
          isLoading={isLoading}
        />
      </div>

      <ScrollArea className="h-[600px] mt-4 pr-3">
        <div className="pb-8">
          {activeAiTab === "writing" && (
            <WritingSuggestions 
              content={content}
              onSuggestionClick={addContentToActiveSection}
            />
          )}
          
          {activeAiTab === "grammar" && (
            <GrammarAnalysis 
              content={content}
            />
          )}

          {activeAiTab === "generate" && (
            <ContentGenerator 
              onSuggestionClick={addContentToActiveSection}
            />
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
