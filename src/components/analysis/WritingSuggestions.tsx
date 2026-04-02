
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { getWritingSuggestions } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor";

interface WritingSuggestionsProps {
  content: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function WritingSuggestions({ content, onSuggestionClick }: WritingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sections, aiTriggerToken, activeAiTab } = useEditor();

  const analyzeSuggestions = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await getWritingSuggestions(content);
      
      // Parse bulleted list from AI (lines starting with - or numbered)
      const parsed = result.content
        .split('\n')
        .map(line => line.replace(/^[\s\-\*•\d\.\)]+/, '').trim())
        .filter(line => line.length > 10); // ignore short lines or empty ones

      setSuggestions(parsed.length > 0 ? parsed : [result.content]);
      
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

  // Listen for global trigger
  useEffect(() => {
    if (aiTriggerToken > 0 && activeAiTab === "writing") {
      analyzeSuggestions();
    }
  }, [aiTriggerToken]);

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
        <p className="text-sm text-muted-foreground mb-2 font-medium font-serif">No sections available.</p>
        <p className="text-xs text-muted-foreground">Please create a section in the editor sidebar first to start using AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clutter-free UI - No manual trigger header */}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-white/50 dark:bg-black/20">
          <div className="relative mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
            </div>
          </div>
          <span className="font-bold text-gray-800 dark:text-gray-100">Reviewing Manuscript...</span>
          <span className="text-[10px] text-muted-foreground mt-2 text-center px-4 max-w-[200px]">Optimizing your rhetorical flow and structural clarity.</span>
        </div>
      ) : (
        <>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">AI Recommendations</h4>
                <Button variant="ghost" size="sm" onClick={() => setSuggestions([])} className="text-[9px] h-5 opacity-40 hover:opacity-100">Dismiss All</Button>
              </div>
              {suggestions.map((suggestion: string, index: number) => (
                <Card
                  key={index}
                  className="p-4 border-none bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none group relative ring-1 ring-gray-100 dark:ring-gray-800 hover:ring-indigo-200 dark:hover:ring-indigo-900 rounded-2xl"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif">{suggestion}</p>
                  <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    Apply Changes
                  </div>
                </Card>
              ))}
            </div>
          ) : content.length > 0 ? (
            <div className="p-10 text-center border-2 border-dotted rounded-3xl bg-gray-50/30 dark:bg-gray-900/10">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Section Analysis Available</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic px-4 leading-relaxed">Click analyze to generate sophisticated writing refinements for your current drafting.</p>
            </div>
          ) : (
            <div className="p-10 text-center border-2 border-dotted rounded-3xl opacity-50">
              <p className="text-xs font-bold text-muted-foreground">Draft is Empty</p>
              <p className="text-[10px] text-muted-foreground mt-2 px-6 leading-relaxed">Input your research or arguments to unlock AI-powered stylistic enhancements.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
