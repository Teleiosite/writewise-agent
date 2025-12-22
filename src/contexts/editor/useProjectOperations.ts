
import { useState } from "react";
import { Section } from './types';
import { useToast } from "@/components/ui/use-toast";

export function useProjectOperations(projectName: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const exportDocument = async (sections: Section[], format: string) => {
    const { downloadDocument, formatContent } = await import("@/utils/documentExport");
    const content = await formatContent(sections, format as any);
    await downloadDocument(content, projectName, format as any);
    toast({
      title: "Document exported",
      description: `Your document has been exported as ${format.toUpperCase()}`,
    });
  };

  return {
    lastSaved,
    setLastSaved,
    exportDocument
  };
}
