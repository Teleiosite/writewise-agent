
import { useEditor } from "@/contexts/editor";
import { EditorHeader } from "./EditorHeader";
import { EditorContent } from "./EditorContent";
import { EditorToolbar } from "./EditorToolbar";
import { EditorCitationsPanel } from "./EditorCitationsPanel";
import { EditorPdfPanel } from "./EditorPdfPanel";
import { EditorPdfChatPanel } from "./EditorPdfChatPanel";
import { Card } from "@/components/ui/card";

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
    showPdfChatPanel,
    toggleCitationsPanel,
    togglePdfReaderPanel,
    togglePdfChatPanel,
    insertCitation,
    addContentToActiveSection
  } = useEditor();

  const sectionTitle = getCurrentSectionTitle();
  const content = getCurrentSectionContent();

  const handleAddPdfContent = (pdfContent: string) => {
    addContentToActiveSection(pdfContent);
  };

  const { showLeftSidebar, showRightSidebar } = useEditor();
  const isWideMode = !showLeftSidebar && !showRightSidebar;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-x md:border rounded-xl md:rounded-2xl overflow-hidden shadow-2xl relative transition-all animate-in fade-in duration-700">
      <EditorToolbar />

      <div className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-gray-900/50 custom-scrollbar">
        <EditorCitationsPanel 
          onInsertCitation={insertCitation}
          show={showCitationsPanel}
        />
        
        <EditorPdfPanel 
          onAddContent={handleAddPdfContent}
          show={showPdfReaderPanel}
        />

        <EditorPdfChatPanel
          onAddContent={handleAddPdfContent}
          show={showPdfChatPanel}
        />
        
        <div className={`mx-auto py-2 px-1 transition-all duration-500 ${isWideMode ? 'max-w-7xl' : 'max-w-5xl'}`}>
           {/* Section Title indicator like Google Docs sub-header */}
           <div className="px-12 py-4 text-muted-foreground text-sm flex items-center gap-2 font-medium">
             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase dark:bg-blue-900/40 dark:text-blue-300">Section</span>
             <span>{sectionTitle || "Main Document"}</span>
           </div>
           
           <EditorContent
            content={content}
            placeholder={`Start writing your ${sectionTitle || "project"}...`}
            onChange={updateSectionContent}
          />
        </div>
      </div>
    </div>
  );
}
