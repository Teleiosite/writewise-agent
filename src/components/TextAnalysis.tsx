
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PenTool } from "lucide-react";

interface TextAnalysisProps {
  content: string;
  onSuggestionClick: (suggestion: string) => void;
}

interface AnalysisResult {
  readabilityScore?: number;
  tone?: string;
  keyThemes?: string[];
  suggestions?: string[];
  grammarIssues?: string[];
}

export function TextAnalysis({ content, onSuggestionClick }: TextAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult>({});
  const [isLoading, setIsLoading] = useState(false);

  const analyzeText = async (type: 'suggestions' | 'analysis' | 'grammar') => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/functions/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, type }),
      });

      const data = await response.json();
      const analysisResult = JSON.parse(data.analysis);
      setAnalysis(prev => ({ ...prev, ...analysisResult }));
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Writing Analysis</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeText('suggestions')}
            disabled={isLoading}
          >
            Get Suggestions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeText('grammar')}
            disabled={isLoading}
          >
            Check Grammar
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {analysis.readabilityScore && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Readability Score</h4>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${analysis.readabilityScore}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {analysis.readabilityScore}/100
                </span>
              </div>
            </Card>
          )}

          {analysis.tone && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Writing Tone</h4>
              <p className="text-sm text-gray-600">{analysis.tone}</p>
            </Card>
          )}

          {analysis.keyThemes && analysis.keyThemes.length > 0 && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Key Themes</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Suggestions</h4>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-2 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <p className="text-sm text-gray-600">{suggestion}</p>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {analysis.grammarIssues && analysis.grammarIssues.length > 0 && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Grammar Issues</h4>
              <div className="space-y-2">
                {analysis.grammarIssues.map((issue, index) => (
                  <Card key={index} className="p-2 bg-red-50">
                    <p className="text-sm text-red-600">{issue}</p>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
