
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { getGrammarAnalysis } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor";

interface GrammarAnalysisProps {
  content: string;
}

export function GrammarAnalysis({ content }: GrammarAnalysisProps) {
  const [grammarIssues, setGrammarIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sections, aiTriggerToken, activeAiTab } = useEditor();

  const analyzeGrammar = async () => {
    if (!content.trim()) {
      toast({
        title: "Section Empty",
        description: "Please populate your section with text to begin a scan.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await getGrammarAnalysis(content);
      
      // Parse bulleted list from AI
      const parsed = result.content
        .split('\n')
        .map(line => line.replace(/^[\s\-\*•\d\.\)]+/, '').trim())
        .filter(line => line.length > 5);

      setGrammarIssues(parsed.length > 0 ? parsed : [result.content]);
      
      toast({
        title: "Inspection Complete",
        description: `Punctuation and syntax have been verified.`,
      });
    } catch (error) {
      console.error('Error analyzing grammar:', error);
      toast({
        title: "Inspection Interrupted",
        description: "An error occurred while verifying the text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for global trigger
  useEffect(() => {
    if (aiTriggerToken > 0 && activeAiTab === "grammar") {
      analyzeGrammar();
    }
  }, [aiTriggerToken]);

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
        <p className="text-sm text-muted-foreground mb-2 font-medium font-serif">No sections available.</p>
        <p className="text-xs text-muted-foreground">Please create a section first to start a grammar scan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clutter-free UI - No manual trigger header */}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-white/50 dark:bg-black/20">
          <div className="relative mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-ping" />
            </div>
          </div>
          <span className="font-bold text-gray-800 dark:text-gray-100">Scanning Section...</span>
          <span className="text-[10px] text-muted-foreground mt-2 text-center px-4 max-w-[200px]">Checking your syntax and diction for total academic precision.</span>
        </div>
      ) : (
        <>
          {grammarIssues.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">Linguistic Findings</h4>
                <Button variant="ghost" size="sm" onClick={() => setGrammarIssues([])} className="text-[9px] h-5 opacity-40 hover:opacity-100">Clear Scan</Button>
              </div>
              {grammarIssues.map((issue: string, index: number) => (
                <Card key={index} className="p-4 border-l-4 border-l-rose-500 bg-white dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 rounded-2xl">
                  <div className="flex gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-mono">{issue}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : content.length > 0 ? (
            <div className="p-10 text-center border-2 border-dotted rounded-3xl bg-gray-50/30 dark:bg-gray-900/10">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Section Check Ready</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic px-4 leading-relaxed">Initiate a scan to verify your grammar, punctuation, and academic tone.</p>
            </div>
          ) : (
            <div className="p-10 text-center border-2 border-dotted rounded-3xl opacity-50">
              <p className="text-xs font-bold text-muted-foreground">Drafting Required</p>
              <p className="text-[10px] text-muted-foreground mt-2 px-6 leading-relaxed">Add content to this section to enable our high-precision linguistic engine.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
