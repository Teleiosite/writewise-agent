
import { useState } from "react";
import { Section } from './types';
import { saveProjectToStorage, loadProjectFromStorage } from './editorStorage';
import { useToast } from "@/hooks/use-toast";

export function useProjectOperations(projectName: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadProject = () => {
    const { sections: savedSections, lastSaved: savedTime } = loadProjectFromStorage(projectName);
    return { savedSections, savedTime };
  };

  const saveProject = (sections: Section[]) => {
    const currentTime = saveProjectToStorage(projectName, sections);
    setLastSaved(currentTime);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved successfully.",
    });
    return currentTime;
  };

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
    loadProject,
    saveProject,
    exportDocument
  };
}
