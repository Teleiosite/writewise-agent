
import { ReactNode } from "react";

interface SuggestedQuestionsHeaderProps {
  children: ReactNode;
}

export function SuggestedQuestionsHeader({ children }: SuggestedQuestionsHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {children}
    </div>
  );
}
