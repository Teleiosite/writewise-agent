
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generateSectionContent } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

interface ContentGeneratorProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ContentGenerator({ onSuggestionClick }: ContentGeneratorProps) {
  const academicSections = [
    "Abstract",
    "Introduction",
    "Literature Review",
    "Methodology",
    "Results",
    "Discussion",
    "Conclusion"
  ];
  
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Generate Paper Sections</h4>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span>Generating content...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {academicSections.map((section) => (
              <Button
                key={section}
                variant="outline"
                onClick={() => generateSection(section)}
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
        </>
      )}
    </div>
  );
}
