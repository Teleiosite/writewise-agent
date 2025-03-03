
import { CitationManager } from "../citations/CitationManager";

interface EditorCitationsPanelProps {
  onInsertCitation: (citation: string) => void;
  show: boolean;
}

export function EditorCitationsPanel({
  onInsertCitation,
  show
}: EditorCitationsPanelProps) {
  if (!show) return null;
  
  return (
    <div className="mb-4">
      <CitationManager onInsertCitation={onInsertCitation} />
    </div>
  );
}
