import { useState } from "react";
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
  const { sections } = useEditor();

  const analyzeSuggestions = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await getWritingSuggestions(content);
      
      const parsed = result.content
        .split('\n')
        .map(line => line.replace(/^[\s\-\*•\d\.\)]+/, '').trim())
        .filter(line => line.length > 10);

      setSuggestions(parsed.length > 0 ? parsed : [result.content]);
      
      toast({
        title: "Analysis Complete",
        description: `Writing suggestions generated.`,
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
        <p className="font-bold text-black dark:text-white uppercase mb-1">No manuscript sections detected.</p>
        <p className="text-zinc-600 dark:text-zinc-400">Create a manuscript section in the sidebar to activate AI style guidance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-3 border border-black dark:border-zinc-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
          <p className="font-bold uppercase tracking-wider text-black dark:text-white">Academic Refinements</p>
        </div>
        <Button 
          size="sm" 
          onClick={analyzeSuggestions} 
          disabled={isLoading || !content.trim()}
          className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none px-4 h-7 font-mono text-xs uppercase tracking-wider border border-black dark:border-white"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            "Analyze Style"
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-black dark:border-zinc-800 bg-white dark:bg-black font-mono text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
          <span className="font-bold uppercase text-black dark:text-white">Reviewing Rhetorical Structure...</span>
          <span className="text-zinc-500 text-[10px] mt-1 text-center">Optimizing academic flow, tone, and conciseness.</span>
        </div>
      ) : (
        <>
          {suggestions.length > 0 ? (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AI Stylistic Recommendations</h4>
                <Button variant="ghost" size="sm" onClick={() => setSuggestions([])} className="text-[10px] h-5 uppercase text-zinc-500 hover:text-black dark:hover:text-white rounded-none">Dismiss All</Button>
              </div>
              {suggestions.map((suggestion: string, index: number) => (
                <Card
                  key={index}
                  className="p-4 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black hover:border-black dark:hover:border-white cursor-pointer transition-all shadow-none group font-sans"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <p className="text-xs text-black dark:text-white leading-relaxed">{suggestion}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] uppercase font-bold text-black dark:text-white">
                    <Sparkles className="w-3 h-3" />
                    Apply Suggestion to Canvas
                  </div>
                </Card>
              ))}
            </div>
          ) : content.length > 0 ? (
            <div className="p-8 text-center border border-dashed border-black dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 font-mono text-xs">
              <p className="font-bold uppercase text-black dark:text-white">Manuscript Guidance Ready</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">Click Analyze Style above to generate academic refinements for your draft.</p>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-black dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 font-mono text-xs">
              <p className="font-bold uppercase text-zinc-400">Canvas Is Empty</p>
              <p className="text-[11px] text-zinc-500 mt-1">Add text to your canvas to receive style and grammar recommendations.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
