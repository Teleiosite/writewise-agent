
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PenTool, MessageSquare, Zap, Brain } from "lucide-react";
import {
  getWritingSuggestions,
  getGrammarAnalysis,
  getContentStructure,
  getSemanticAnalysis,
  getChatbotResponse
} from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

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
  structure?: any;
  semantics?: any;
  chatResponse?: string;
}

export function TextAnalysis({ content, onSuggestionClick }: TextAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("writing");
  const { toast } = useToast();

  const analyzeText = async (type: string) => {
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      let result;
      switch (type) {
        case 'writing':
          result = await getWritingSuggestions(content);
          setAnalysis(prev => ({ ...prev, suggestions: [result.content] }));
          break;
        case 'grammar':
          result = await getGrammarAnalysis(content);
          setAnalysis(prev => ({ ...prev, grammarIssues: [result.content] }));
          break;
        case 'structure':
          result = await getContentStructure(content);
          setAnalysis(prev => ({ ...prev, structure: result.content }));
          break;
        case 'semantics':
          result = await getSemanticAnalysis(content);
          setAnalysis(prev => ({ ...prev, semantics: result.content }));
          break;
        case 'chat':
          result = await getChatbotResponse(content);
          setAnalysis(prev => ({ ...prev, chatResponse: result.content }));
          break;
      }
      
      toast({
        title: "Analysis Complete",
        description: `Analysis from ${result.source} completed successfully.`,
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "writing" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("writing");
              analyzeText("writing");
            }}
            disabled={isLoading}
          >
            <PenTool className="w-4 h-4 mr-1" />
            Writing
          </Button>
          <Button
            variant={activeTab === "grammar" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("grammar");
              analyzeText("grammar");
            }}
            disabled={isLoading}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Grammar
          </Button>
          <Button
            variant={activeTab === "structure" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("structure");
              analyzeText("structure");
            }}
            disabled={isLoading}
          >
            <Zap className="w-4 h-4 mr-1" />
            Structure
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("chat");
              analyzeText("chat");
            }}
            disabled={isLoading}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {activeTab === "writing" && analysis.suggestions && (
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
          )}

          {activeTab === "grammar" && analysis.grammarIssues && (
            <div className="space-y-2">
              {analysis.grammarIssues.map((issue, index) => (
                <Card key={index} className="p-2 bg-red-50">
                  <p className="text-sm text-red-600">{issue}</p>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "structure" && analysis.structure && (
            <Card className="p-3">
              <h4 className="font-medium mb-2">Content Structure</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(analysis.structure, null, 2)}
              </pre>
            </Card>
          )}

          {activeTab === "chat" && analysis.chatResponse && (
            <Card className="p-3">
              <div className="flex items-start space-x-2">
                <Brain className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">{analysis.chatResponse}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
