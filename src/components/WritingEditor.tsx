import { EditorProvider } from "@/contexts/editor";
import { TextAnalysis } from "./TextAnalysis";
import { EditorSidebar } from "./editor/EditorSidebar";
import { EditorMain } from "./editor/EditorMain";
import { EditorToolbar } from "./editor/EditorToolbar";
import { PdfReaderPanel } from "./editor/PdfReaderPanel";
import { CitationManager } from "./citations/CitationManager";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { TemplateType } from "./DocumentTemplates";
import { useEditor } from "@/contexts/editor";
import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

// This component uses the context but needs to be inside the provider
function EditorContent({ projectName }: { projectName: string }) {
  const { 
    showCitationsPanel, 
    toggleCitationsPanel,
    showPdfReaderPanel, 
    togglePdfReaderPanel,
    showAnalysisPanel,
    addContentToActiveSection,
    insertCitation 
  } = useEditor();

  // Inject narrative from Data Analysis page if one is pending
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingNarrative');
    if (pending) {
      sessionStorage.removeItem('pendingNarrative');
      addContentToActiveSection('\n\n' + pending);
      toast.success('Chapter 4 & 5 narrative inserted into your document!');
    }
  }, [addContentToActiveSection]);

  return (
    // h-full fills the viewport pane from DashboardTabContent; overflow-hidden prevents page scroll
    <div className="grid grid-cols-1 md:grid-cols-12 h-full bg-gray-50/50 dark:bg-gray-900/10 font-sans overflow-hidden">
      {/* Left Sidebar: Document Structure Navigation */}
      <div className="md:col-span-3 h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
        <EditorSidebar />
      </div>

      {/* Main Manuscript Canvas */}
      <div className={`${showAnalysisPanel ? 'md:col-span-6' : 'md:col-span-9'} h-full transition-all duration-500 ease-in-out`}>
        <EditorMain 
          projectName={projectName} 
        />
      </div>

      {/* Right AI Assistant Guidance Panel */}
      {showAnalysisPanel && (
        <div className="md:col-span-3 h-full overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-zinc-200 dark:border-zinc-800">
          <div className="p-4">
            <TextAnalysis />
          </div>
        </div>
      )}

      {/* Modal Dialog for Citation Suite */}
      <Dialog open={showCitationsPanel} onOpenChange={toggleCitationsPanel}>
        <DialogContent className="max-w-4xl p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto flex-1 p-2 sm:p-4">
            <CitationManager 
              onInsertCitation={(citation) => {
                insertCitation(citation);
              }}
              onInsertBibliography={(bib) => {
                addContentToActiveSection('\n\n### References\n\n' + bib + '\n');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog for PDF Research & Chat Suite */}
      <Dialog open={showPdfReaderPanel} onOpenChange={togglePdfReaderPanel}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <PdfReaderPanel 
              onAddContent={(content) => {
                addContentToActiveSection(content);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
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
    <div className="h-full w-full animate-fadeIn overflow-hidden">
      <EditorContent 
        projectName={projectName} 
      />
    </div>
  );
}
