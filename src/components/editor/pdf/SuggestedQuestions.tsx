
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LightbulbIcon, Loader2 } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  onGenerateQuestions: () => void;
  isLoading: boolean;
}

export function SuggestedQuestions({ 
  questions, 
  onQuestionClick, 
  onGenerateQuestions, 
  isLoading 
}: SuggestedQuestionsProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onGenerateQuestions}
          disabled={isLoading}
        >
          <LightbulbIcon className="h-4 w-4 mr-1" />
          Generate Questions
        </Button>
      </div>
      
      {questions.length > 0 && (
        <ScrollArea className="h-24 border rounded-md p-2">
          <div className="space-y-1">
            {questions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-xs h-auto py-1"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
