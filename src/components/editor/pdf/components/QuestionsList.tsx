
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface QuestionsListProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function QuestionsList({ 
  questions, 
  onQuestionClick 
}: QuestionsListProps) {
  const [visibleQuestions, setVisibleQuestions] = useState<boolean[]>([]);
  
  useEffect(() => {
    // Create a staggered animation effect by gradually setting questions to visible
    if (questions.length > 0) {
      const newVisibleState = Array(questions.length).fill(false);
      
      questions.forEach((_, index) => {
        setTimeout(() => {
          setVisibleQuestions(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        }, 100 * index); // Stagger by 100ms per question
      });
      
      setVisibleQuestions(newVisibleState);
    }
  }, [questions]);
  
  if (questions.length === 0) return null;
  
  return (
    <ScrollArea className="h-24 border rounded-md p-2">
      <div className="space-y-1">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-left text-xs h-auto py-1 transition-all duration-300 ${
              visibleQuestions[index] 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
            }`}
            onClick={() => onQuestionClick(question)}
            aria-label={`Ask: ${question}`}
          >
            <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="truncate">{question}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
