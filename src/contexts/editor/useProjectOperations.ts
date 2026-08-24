import { useState } from "react";
import { Section } from './types';
import { toast } from "sonner";
import { exportToOverleafLatexZip } from "@/services/latexExportService";

export function useProjectOperations(projectName: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const exportDocument = async (sections: Section[], format: string) => {
    try {
      if (format === 'latex' || format === 'tex' || format === 'zip') {
        toast.info("Compiling Overleaf LaTeX package (.zip)...");
        await exportToOverleafLatexZip(projectName, sections);
        toast.success("Downloaded Overleaf LaTeX package (.zip with main.tex & references.bib)");
        return;
      }

      const { downloadDocument, formatContent } = await import("@/utils/documentExport");
      const content = await formatContent(sections, format as any);
      await downloadDocument(content, projectName, format as any);
      toast.success(`Exported document as ${format.toUpperCase()}`);
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  return {
    lastSaved,
    setLastSaved,
    exportDocument
  };
}
