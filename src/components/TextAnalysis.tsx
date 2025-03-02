
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool, Loader2 } from "lucide-react";
import { AnalysisTabs } from "./analysis/AnalysisTabs";
import { WritingSuggestions } from "./analysis/WritingSuggestions";
import { GrammarAnalysis } from "./analysis/GrammarAnalysis";
import { ContentGenerator } from "./analysis/ContentGenerator";

interface TextAnalysisProps {
  content: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function TextAnalysis({ content, onSuggestionClick }: TextAnalysisProps) {
  const [activeTab, setActiveTab] = useState<string>("writing");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>("");

  // Auto-analyze content when it changes (with debounce)
  useEffect(() => {
    // Skip empty content
    if (!content.trim()) return;
    
    // Skip if content hasn't changed enough
    if (content.length > 0 && 
        lastAnalyzedContent.length > 0 && 
        Math.abs(content.length - lastAnalyzedContent.length) < 20) return;
    
    // Set a timeout to avoid too frequent analyses
    const timer = setTimeout(() => {
      setLastAnalyzedContent(content);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content, lastAnalyzedContent]);

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
            onSuggestionClick={onSuggestionClick}
          />
        )}
        
        {activeTab === "grammar" && (
          <GrammarAnalysis 
            content={content}
          />
        )}
        
        {activeTab === "generate" && (
          <ContentGenerator 
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </ScrollArea>
    </Card>
  );
}
