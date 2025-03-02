
import { EditorProvider } from "@/contexts/EditorContext";
import { TextAnalysis } from "./TextAnalysis";
import { EditorSidebar } from "./editor/EditorSidebar";
import { EditorMain } from "./editor/EditorMain";
import { EditorToolbar } from "./editor/EditorToolbar";
import type { TemplateType } from "./DocumentTemplates";

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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <EditorSidebar />
          </div>

          <div className="md:col-span-6 space-y-4">
            <EditorMain 
              projectName={projectName}
            />
          </div>

          <div className="md:col-span-3">
            <TextAnalysis />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
