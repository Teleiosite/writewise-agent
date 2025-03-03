
import { Card } from "@/components/ui/card";
import { useEditor } from "@/contexts/editor";
import { EditorHeader } from "./EditorHeader";
import { EditorContent } from "./EditorContent";
import { EditorCitationsPanel } from "./EditorCitationsPanel";
import { EditorPdfPanel } from "./EditorPdfPanel";

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
      <EditorHeader 
        title={sectionTitle || projectName}
        showCitationsPanel={showCitationsPanel}
        showPdfReaderPanel={showPdfReaderPanel}
        toggleCitationsPanel={toggleCitationsPanel}
        togglePdfReaderPanel={togglePdfReaderPanel}
      />
      
      <EditorCitationsPanel 
        onInsertCitation={insertCitation}
        show={showCitationsPanel}
      />
      
      <EditorPdfPanel 
        onAddContent={handleAddPdfContent}
        show={showPdfReaderPanel}
      />
      
      <EditorContent
        content={content}
        placeholder={`Start writing your ${sectionTitle || "project"}...`}
        onChange={updateSectionContent}
      />
    </Card>
  );
}
