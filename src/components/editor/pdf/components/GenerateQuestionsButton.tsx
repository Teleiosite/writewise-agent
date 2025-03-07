
import { Button } from "@/components/ui/button";
import { LightbulbIcon } from "lucide-react";

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
    >
      <LightbulbIcon className="h-4 w-4 mr-1" />
      Generate Questions
    </Button>
  );
}
