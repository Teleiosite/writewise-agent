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
function EditorContent({ 
  projectName, 
  showLeftSidebar, 
  showRightSidebar 
}: { 
  projectName: string, 
  showLeftSidebar: boolean, 
  showRightSidebar: boolean 
}) {
  const { 
    showCitationsPanel, 
    showPdfReaderPanel, 
    addContentToActiveSection,
    insertCitation 
  } = useEditor();
  
  // Calculate grid columns based on visibility
  // Max columns are 12. 
  // Sidebar takes 3. Analysis takes 3.
  const mainColSpan = 12 - (showLeftSidebar ? 3 : 0) - (showRightSidebar ? 3 : 0);
  
  return (
    <div className="flex justify-center w-full bg-gray-50/50 dark:bg-gray-900/10 min-h-[calc(100vh-80px)]">
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6 w-full ${mainColSpan === 12 ? 'max-w-7xl' : 'max-w-full'}`}>
        {showLeftSidebar && (
          <div className="md:col-span-3 h-full animate-in slide-in-from-left duration-300">
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
        )}

        <div className={`h-full min-h-[800px] transition-all duration-500 ease-in-out md:col-span-${mainColSpan}`}>
          <EditorMain 
            projectName={projectName} 
          />
        </div>

        {showRightSidebar && (
          <div className="md:col-span-3 h-full animate-in slide-in-from-right duration-300">
            <div className="sticky top-6">
              <TextAnalysis />
            </div>
          </div>
        )}
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
  const { showLeftSidebar, showRightSidebar } = useEditor();

  return (
    <div className="w-full animate-fadeIn overflow-x-hidden">
      <EditorContent 
        projectName={projectName} 
        showLeftSidebar={showLeftSidebar}
        showRightSidebar={showRightSidebar}
      />
    </div>
  );
}
