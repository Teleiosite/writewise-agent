
import { ReactNode } from "react";

interface SuggestedQuestionsContainerProps {
  children: ReactNode;
}

export function SuggestedQuestionsContainer({ children }: SuggestedQuestionsContainerProps) {
  return (
    <div className="mb-3 rounded-md p-2 bg-muted/50 dark:bg-slate-800/40 dark:backdrop-blur-sm border dark:border-slate-700/50 animate-scale-in transition-colors duration-300 ease-in-out dark:shadow-inner dark:shadow-slate-900/20">
      {children}
    </div>
  );
}
