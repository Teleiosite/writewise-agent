
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool } from "lucide-react";
import { AnalysisTabs } from "./analysis/AnalysisTabs";
import { WritingSuggestions } from "./analysis/WritingSuggestions";
import { GrammarAnalysis } from "./analysis/GrammarAnalysis";
import { ContentGenerator } from "./analysis/ContentGenerator";
import { useEditor } from "@/contexts/EditorContext";

export function TextAnalysis() {
  const [activeTab, setActiveTab] = useState<string>("writing");
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentSectionContent, addContentToActiveSection } = useEditor();
  
  const content = getCurrentSectionContent();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <AnalysisTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isLoading={isLoading}
        />
      </div>

      <ScrollArea className="h-[400px] mt-4">
        {activeTab === "writing" && (
          <WritingSuggestions 
            content={content}
            onSuggestionClick={addContentToActiveSection}
          />
        )}
        
        {activeTab === "grammar" && (
          <GrammarAnalysis 
            content={content}
          />
        )}
        
        {activeTab === "generate" && (
          <ContentGenerator 
            onSuggestionClick={addContentToActiveSection}
          />
        )}
      </ScrollArea>
    </Card>
  );
}
