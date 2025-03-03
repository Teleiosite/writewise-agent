import { EditorProvider } from "@/contexts/editor";
import { TextAnalysis } from "./TextAnalysis";
import { EditorSidebar } from "./editor/EditorSidebar";
import { EditorMain } from "./editor/EditorMain";
import { EditorToolbar } from "./editor/EditorToolbar";
import { PdfReaderPanel } from "./editor/PdfReaderPanel";
import { CitationManager } from "./citations/CitationManager";
import type { TemplateType } from "./DocumentTemplates";
import { useEditor } from "@/contexts/editor";

// This component uses the context but needs to be inside the provider
function EditorContent({ projectName }: { projectName: string }) {
  const { 
    showCitationsPanel, 
    showPdfReaderPanel, 
    addContentToActiveSection,
    insertCitation 
  } = useEditor();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3">
        <EditorSidebar />
        {showPdfReaderPanel && (
          <div className="mt-4">
            <PdfReaderPanel onAddContent={addContentToActiveSection} />
          </div>
        )}
        {showCitationsPanel && (
          <div className="mt-4">
            <CitationManager onInsertCitation={insertCitation} />
          </div>
        )}
      </div>

      <div className="md:col-span-6 space-y-4">
        <EditorMain projectName={projectName} />
      </div>

      <div className="md:col-span-3">
        <TextAnalysis />
      </div>
    </div>
  );
}

interface WritingEditorProps {
  onClose: () => void;
  projectName: string;
  template?: TemplateType;
  showCitations?: boolean;
  showPdfReader?: boolean;
}

export function WritingEditor({
  onClose,
  projectName,
  template,
  showCitations = false,
  showPdfReader = false
}: WritingEditorProps) {
  return (
    <EditorProvider projectName={projectName} template={template}>
      <div className="max-w-7xl mx-auto animate-fadeIn space-y-4">
        <EditorToolbar onClose={onClose} />
        <EditorContent projectName={projectName} />
      </div>
    </EditorProvider>
  );
}
