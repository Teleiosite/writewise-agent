
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionsListProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function QuestionsList({ 
  questions, 
  onQuestionClick 
}: QuestionsListProps) {
  if (questions.length === 0) return null;
  
  return (
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
  );
}
