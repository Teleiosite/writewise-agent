
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Quote, BookOpen } from "lucide-react";
import { CitationManager } from "../CitationManager";
import { PdfReaderPanel } from "./PdfReaderPanel";

interface EditorMainProps {
  sectionTitle: string;
  projectName: string;
  content: string;
  onContentChange: (content: string) => void;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  onToggleCitations: () => void;
  onTogglePdfReader: () => void;
  onInsertCitation: (citation: string) => void;
}

export function EditorMain({
  sectionTitle,
  projectName,
  content,
  onContentChange,
  showCitationsPanel,
  showPdfReaderPanel,
  onToggleCitations,
  onTogglePdfReader,
  onInsertCitation,
}: EditorMainProps) {
  const handleAddPdfContent = (pdfContent: string) => {
    onContentChange(content + "\n\n" + pdfContent);
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{sectionTitle || projectName}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={showCitationsPanel ? "default" : "ghost"}
            size="sm"
            onClick={onToggleCitations}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button 
            variant={showPdfReaderPanel ? "default" : "ghost"}
            size="sm"
            onClick={onTogglePdfReader}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showCitationsPanel && (
        <div className="mb-4">
          <CitationManager onInsertCitation={onInsertCitation} />
        </div>
      )}
      
      {showPdfReaderPanel && (
        <div className="mb-4">
          <PdfReaderPanel onAddContent={handleAddPdfContent} />
        </div>
      )}
      
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={`Start writing your ${sectionTitle || "project"}...`}
        className="min-h-[500px] resize-none"
      />
    </Card>
  );
}
