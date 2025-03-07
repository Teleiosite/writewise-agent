
import { PdfChatInterface } from "./pdf/PdfChatInterface";

interface EditorPdfChatPanelProps {
  onAddContent: (content: string) => void;
  show: boolean;
}

export function EditorPdfChatPanel({
  onAddContent,
  show
}: EditorPdfChatPanelProps) {
  if (!show) return null;
  
  return (
    <div className="mb-4">
      <PdfChatInterface onAddContent={onAddContent} />
    </div>
  );
}
