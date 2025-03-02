
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getWritingSuggestions } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

interface WritingSuggestionsProps {
  content: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function WritingSuggestions({ content, onSuggestionClick }: WritingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeSuggestions = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await getWritingSuggestions(content);
      setSuggestions([result.content]);
      
      toast({
        title: "Analysis Complete",
        description: `Writing suggestions completed successfully.`,
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
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span>Analyzing your writing...</span>
        </div>
      ) : (
        <>
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Writing Suggestions</h4>
              {suggestions.map((suggestion: string, index: number) => (
                <Card
                  key={index}
                  className="p-2 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <p className="text-sm text-gray-600">{suggestion}</p>
                </Card>
              ))}
            </div>
          ) : content.length > 0 ? (
            <div className="p-3 text-center text-gray-500">
              <p>Analyzing your writing...</p>
              <p className="text-xs mt-1">Real-time feedback will appear here.</p>
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              <p>Start writing to get AI-powered suggestions.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
