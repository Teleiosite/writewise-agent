
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getGrammarAnalysis } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

interface GrammarAnalysisProps {
  content: string;
}

export function GrammarAnalysis({ content }: GrammarAnalysisProps) {
  const [grammarIssues, setGrammarIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeGrammar = async () => {
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
      const result = await getGrammarAnalysis(content);
      setGrammarIssues([result.content]);
      
      toast({
        title: "Analysis Complete",
        description: `Grammar analysis completed successfully.`,
      });
    } catch (error) {
      console.error('Error analyzing grammar:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the grammar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span>Analyzing grammar...</span>
        </div>
      ) : (
        <>
          {grammarIssues.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Grammar Analysis</h4>
              {grammarIssues.map((issue: string, index: number) => (
                <Card key={index} className="p-2 bg-red-50">
                  <p className="text-sm text-red-600">{issue}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              <p>Click analyze to check grammar and spelling.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
