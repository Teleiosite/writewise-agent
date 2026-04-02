
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, LayoutTemplate } from "lucide-react";
import { generateSectionContent } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/contexts/editor";

export function ContentGenerator({ onSuggestionClick }: { onSuggestionClick: (s: string) => void }) {
  const academicSections = [
    "Abstract",
    "Chapter 1: Introduction",
    "Chapter 2: Literature Review",
    "Chapter 3: Methodology",
    "Chapter 4: Results",
    "Chapter 5: Conclusion / Discussion",
    "Conclusion",
    "Data Analysis"
  ];
  
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sections } = useEditor();

  const generateSection = async (section: string) => {
    setIsLoading(true);
    try {
      const projectTitle = localStorage.getItem('projectName') || "Research Paper";
      const result = await generateSectionContent(projectTitle, section);
      setGeneratedContent(result.content);
      
      toast({
        title: `${section} Drafted`,
        description: "Review the draft and click to insert.",
      });
    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: "Drafting Interrupted",
        description: "AI was unable to generate this section.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
        <p className="text-sm text-muted-foreground mb-2 font-medium font-serif">No section active.</p>
        <p className="text-xs text-muted-foreground">Please create a section first to start generating content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">Structural Drafting</h4>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-white/50 dark:bg-black/20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <span className="font-bold text-gray-800 dark:text-gray-100">Drafting Content...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {academicSections.map((section) => (
              <Button
                key={section}
                variant="outline"
                size="sm"
                onClick={() => generateSection(section)}
                className="text-[10px] h-9 border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all rounded-xl"
              >
                {section}
              </Button>
            ))}
          </div>
          
          {generatedContent && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">Generated Draft</h4>
                <Button variant="ghost" size="sm" onClick={() => setGeneratedContent("")} className="text-[9px] h-5 opacity-40 hover:opacity-100">Discard</Button>
              </div>
              <Card 
                className="p-4 border-none bg-indigo-50/30 dark:bg-indigo-950/10 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all ring-1 ring-indigo-100 dark:ring-indigo-900/30 rounded-2xl group" 
                onClick={() => onSuggestionClick(generatedContent)}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif">{generatedContent}</p>
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  <PlusCircle className="w-3 h-3" />
                  Insert into Section
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
