
import { PdfReaderPanel } from "./PdfReaderPanel";

interface EditorPdfPanelProps {
  onAddContent: (content: string) => void;
  show: boolean;
}

export function EditorPdfPanel({
  onAddContent,
  show
}: EditorPdfPanelProps) {
  if (!show) return null;
  
  return (
    <div className="mb-4">
      <PdfReaderPanel onAddContent={onAddContent} />
    </div>
  );
}
