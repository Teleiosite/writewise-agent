
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PenTool, MessageSquare, Zap, Brain, FileText } from "lucide-react";
import {
  getWritingSuggestions,
  getGrammarAnalysis,
  getContentStructure,
  getSemanticAnalysis,
  getChatbotResponse,
  generateSectionContent
} from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

interface TextAnalysisProps {
  content: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function TextAnalysis({ content, onSuggestionClick }: TextAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("writing");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const { toast } = useToast();

  const academicSections = [
    "Abstract",
    "Introduction",
    "Literature Review",
    "Methodology",
    "Results",
    "Discussion",
    "Conclusion"
  ];

  const generateSection = async (section: string) => {
    setIsLoading(true);
    try {
      const projectTitle = localStorage.getItem('projectName') || "Research Paper";
      const result = await generateSectionContent(projectTitle, section);
      setGeneratedContent(result.content);
      
      toast({
        title: `${section} Generated`,
        description: "Click to insert the generated content into your document.",
      });
    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate the section content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        case 'generate':
          setActiveTab('generate');
          return;
        default:
          result = await getSemanticAnalysis(content);
          setAnalysis(prev => ({ ...prev, semantics: result.content }));
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
    <Card className="p-4">
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
            variant={activeTab === "generate" ? "default" : "outline"}
            size="sm"
            onClick={() => analyzeText("generate")}
            disabled={isLoading}
          >
            <FileText className="w-4 h-4 mr-1" />
            Generate
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] mt-4">
        {activeTab === "generate" ? (
          <div className="space-y-4">
            <h4 className="font-medium">Generate Paper Sections</h4>
            <div className="grid grid-cols-2 gap-2">
              {academicSections.map((section) => (
                <Button
                  key={section}
                  variant="outline"
                  onClick={() => generateSection(section)}
                  disabled={isLoading}
                >
                  {section}
                </Button>
              ))}
            </div>
            {generatedContent && (
              <Card className="p-3 mt-4 cursor-pointer hover:bg-gray-50" onClick={() => onSuggestionClick(generatedContent)}>
                <p className="text-sm text-gray-600">{generatedContent}</p>
                <p className="text-xs text-gray-400 mt-2">Click to insert this content</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "writing" && analysis.suggestions && (
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion: string, index: number) => (
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
                {analysis.grammarIssues.map((issue: string, index: number) => (
                  <Card key={index} className="p-2 bg-red-50">
                    <p className="text-sm text-red-600">{issue}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
