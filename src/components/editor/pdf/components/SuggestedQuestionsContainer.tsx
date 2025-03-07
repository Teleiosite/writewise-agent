
import { ReactNode } from "react";

interface SuggestedQuestionsContainerProps {
  children: ReactNode;
}

export function SuggestedQuestionsContainer({ children }: SuggestedQuestionsContainerProps) {
  return (
    <div className="mb-3">
      {children}
    </div>
  );
}
