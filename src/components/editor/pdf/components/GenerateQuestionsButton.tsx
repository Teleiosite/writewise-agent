
import { Button } from "@/components/ui/button";
import { LightbulbIcon, Loader2 } from "lucide-react";

interface GenerateQuestionsButtonProps {
  onGenerateQuestions: () => void;
  isLoading: boolean;
}

export function GenerateQuestionsButton({ 
  onGenerateQuestions, 
  isLoading 
}: GenerateQuestionsButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onGenerateQuestions}
      disabled={isLoading}
      className="transition-all duration-300 hover:scale-105"
      aria-label="Generate suggested questions"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <LightbulbIcon className="h-4 w-4 mr-1" />
      )}
      {isLoading ? "Generating..." : "Generate Questions"}
    </Button>
  );
}
