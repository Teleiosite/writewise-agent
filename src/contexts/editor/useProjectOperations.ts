import { useState } from "react";
import { Section } from './types';
import { toast } from "sonner";
import { exportToOverleafLatexZip } from "@/services/latexExportService";

export function useProjectOperations(projectName: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const exportDocument = async (sections: Section[], format: string) => {
    try {
      const normFormat = (format || 'docx').toLowerCase();

      // Ensure sections have content: if sections array is empty or content is empty, grab from DOM
      let exportSections = sections ? [...sections] : [];
      const editorEl = document.querySelector<HTMLElement>('[contenteditable="true"]');
      const domContent = editorEl?.innerHTML || "";

      if (exportSections.length === 0) {
        exportSections = [{
          id: 'main',
          title: projectName || 'Manuscript',
          content: domContent,
          order: 0
        }];
      } else {
        // If all sections have empty content, populate the first section with DOM content
        const allEmpty = exportSections.every(s => !s.content || s.content.trim() === "");
        if (allEmpty && domContent) {
          exportSections[0] = { ...exportSections[0], content: domContent };
        }
      }

      if (normFormat === 'latex' || normFormat === 'tex' || normFormat === 'zip') {
        toast.info("Compiling Overleaf LaTeX package (.zip)...");
        await exportToOverleafLatexZip(projectName, exportSections);
        toast.success("Downloaded Overleaf LaTeX package (.zip with main.tex & references.bib)");
        return;
      }

      const { downloadDocument, formatContent } = await import("@/utils/documentExport");
      const content = await formatContent(exportSections, normFormat as any);
      await downloadDocument(content, projectName, normFormat as any);
      toast.success(`Exported document as ${normFormat.toUpperCase()}`);
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Export failed: ${err.message || 'Unknown error'}`);
    }
  };

  return {
    lastSaved,
    setLastSaved,
    exportDocument
  };
}
