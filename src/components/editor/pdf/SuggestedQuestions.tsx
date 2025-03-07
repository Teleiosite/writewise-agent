
import { GenerateQuestionsButton } from "./components/GenerateQuestionsButton";
import { QuestionsList } from "./components/QuestionsList";
import { SuggestedQuestionsHeader } from "./components/SuggestedQuestionsHeader";
import { SuggestedQuestionsContainer } from "./components/SuggestedQuestionsContainer";

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
    <SuggestedQuestionsContainer>
      <SuggestedQuestionsHeader>
        <GenerateQuestionsButton 
          onGenerateQuestions={onGenerateQuestions} 
          isLoading={isLoading} 
        />
      </SuggestedQuestionsHeader>
      
      <QuestionsList 
        questions={questions} 
        onQuestionClick={onQuestionClick} 
      />
    </SuggestedQuestionsContainer>
  );
}
