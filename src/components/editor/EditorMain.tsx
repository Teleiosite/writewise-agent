
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Quote, BookOpen } from "lucide-react";
import { CitationManager } from "../CitationManager";
import { PdfReaderPanel } from "./PdfReaderPanel";
import { useEditor } from "@/contexts/EditorContext";

interface EditorMainProps {
  projectName: string;
}

export function EditorMain({ projectName }: EditorMainProps) {
  const { 
    getCurrentSectionTitle, 
    getCurrentSectionContent,
    updateSectionContent,
    showCitationsPanel,
    showPdfReaderPanel,
    toggleCitationsPanel,
    togglePdfReaderPanel,
    insertCitation,
    addContentToActiveSection
  } = useEditor();

  const sectionTitle = getCurrentSectionTitle();
  const content = getCurrentSectionContent();

  const handleAddPdfContent = (pdfContent: string) => {
    addContentToActiveSection(pdfContent);
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{sectionTitle || projectName}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={showCitationsPanel ? "default" : "ghost"}
            size="sm"
            onClick={toggleCitationsPanel}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button 
            variant={showPdfReaderPanel ? "default" : "ghost"}
            size="sm"
            onClick={togglePdfReaderPanel}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showCitationsPanel && (
        <div className="mb-4">
          <CitationManager onInsertCitation={insertCitation} />
        </div>
      )}
      
      {showPdfReaderPanel && (
        <div className="mb-4">
          <PdfReaderPanel onAddContent={handleAddPdfContent} />
        </div>
      )}
      
      <Textarea
        value={content}
        onChange={(e) => updateSectionContent(e.target.value)}
        placeholder={`Start writing your ${sectionTitle || "project"}...`}
        className="min-h-[500px] resize-none"
      />
    </Card>
  );
}
