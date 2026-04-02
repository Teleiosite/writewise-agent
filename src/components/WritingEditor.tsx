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
    showAnalysisPanel,
    addContentToActiveSection,
    insertCitation 
  } = useEditor();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/10 min-h-[calc(100vh-80px)] transition-all duration-500">
      <div className="md:col-span-3 h-full">
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

      <div className={`${showAnalysisPanel ? 'md:col-span-6' : 'md:col-span-9'} h-full min-h-[800px] transition-all duration-500 ease-in-out`}>
        <EditorMain 
          projectName={projectName} 
        />
      </div>

      {showAnalysisPanel && (
        <div className="md:col-span-3 h-full animate-in slide-in-from-right duration-300">
          <div className="sticky top-6">
            <TextAnalysis />
          </div>
        </div>
      )}
    </div>
  );
}

interface WritingEditorProps {
  onClose: () => void;
  projectName: string;
  template?: TemplateType;
  showCitations?: boolean;
  showPdfReader?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function WritingEditor({
  onClose,
  projectName,
  template,
  showCitations = false,
  showPdfReader = false,
  activeTab,
  setActiveTab
}: WritingEditorProps) {
  return (
    <div className="w-full animate-fadeIn overflow-x-hidden">
      <EditorContent 
        projectName={projectName} 
      />
    </div>
  );
}
