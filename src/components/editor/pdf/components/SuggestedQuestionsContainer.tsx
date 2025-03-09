
import { ReactNode } from "react";

interface SuggestedQuestionsContainerProps {
  children: ReactNode;
}

export function SuggestedQuestionsContainer({ children }: SuggestedQuestionsContainerProps) {
  return (
    <div className="mb-3 rounded-md p-2 bg-muted/50 dark:bg-muted/30 border animate-scale-in">
      {children}
    </div>
  );
}
