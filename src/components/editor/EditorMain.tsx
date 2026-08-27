import { useEditor } from "@/contexts/editor";
import { EditorContent } from "./EditorContent";
import { EditorCitationsPanel } from "./EditorCitationsPanel";
import { EditorPdfPanel } from "./EditorPdfPanel";
import { EditorPdfChatPanel } from "./EditorPdfChatPanel";

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
    insertCitation,
    addContentToActiveSection
  } = useEditor();

  const sectionTitle = getCurrentSectionTitle();
  const content = getCurrentSectionContent();

  const handleAddPdfContent = (pdfContent: string) => {
    addContentToActiveSection(pdfContent);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-black border border-black dark:border-zinc-800 rounded-none shadow-none relative font-sans">
      <div className="bg-white dark:bg-black">
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
        
        <div className="max-w-5xl mx-auto py-2 px-1">
           {/* Section Title indicator */}
           <div className="px-12 py-3 text-zinc-600 dark:text-zinc-400 text-xs flex items-center gap-2 font-mono">
             <span className="mono-badge">SECTION</span>
             <span className="font-bold text-black dark:text-white uppercase tracking-wider">{sectionTitle || "Main Document"}</span>
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
