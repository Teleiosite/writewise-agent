
import { GenerateQuestionsButton } from "./components/GenerateQuestionsButton";
import { QuestionsList } from "./components/QuestionsList";

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
        <GenerateQuestionsButton 
          onGenerateQuestions={onGenerateQuestions} 
          isLoading={isLoading} 
        />
      </div>
      
      <QuestionsList 
        questions={questions} 
        onQuestionClick={onQuestionClick} 
      />
    </div>
  );
}
