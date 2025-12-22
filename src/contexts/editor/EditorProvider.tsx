
import React, { createContext, useContext, ReactNode } from "react";
import { Section, EditorContextType } from './types';
import { useSectionManager } from './useSectionManager';
import { usePanelManager } from './usePanelManager';
import { useProjectOperations } from './useProjectOperations';
import { useProjects } from "@/contexts/ProjectContext";

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children, projectName, template }: { 
  children: ReactNode; 
  projectName: string;
  template?: any;
}) {
  const { projects } = useProjects();
  const project = projects.find(p => p.name === projectName);
  const projectId = project?.id;

  const sectionManager = useSectionManager(projectId);
  const panelManager = usePanelManager();
  const projectOps = useProjectOperations(projectName);

  const exportDocument = async (format: string) => {
    await projectOps.exportDocument(sectionManager.sections, format);
  };

  return (
    <EditorContext.Provider
      value={{
        // State
        sections: sectionManager.sections,
        activeSection: sectionManager.activeSection,
        lastSaved: projectOps.lastSaved, // This will need to be updated
        showCitationsPanel: panelManager.showCitationsPanel,
        showPdfReaderPanel: panelManager.showPdfReaderPanel,
        showPdfChatPanel: panelManager.showPdfChatPanel,
        wordCount: sectionManager.wordCount,
        readingTime: sectionManager.readingTime,
        isAutoSaving: false, // This will need to be updated
        
        // Actions
        setSections: sectionManager.setSections,
        setActiveSection: sectionManager.setActiveSection,
        createSection: sectionManager.createSection,
        updateSectionContent: sectionManager.updateSectionContent,
        getCurrentSectionContent: sectionManager.getCurrentSectionContent,
        getCurrentSectionTitle: sectionManager.getCurrentSectionTitle,
        toggleCitationsPanel: panelManager.toggleCitationsPanel,
        togglePdfReaderPanel: panelManager.togglePdfReaderPanel,
        togglePdfChatPanel: panelManager.togglePdfChatPanel,
        saveProject: () => { console.log('Save project not implemented yet') },
        exportDocument,
        addContentToActiveSection: sectionManager.addContentToActiveSection,
        insertCitation: sectionManager.insertCitation
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
