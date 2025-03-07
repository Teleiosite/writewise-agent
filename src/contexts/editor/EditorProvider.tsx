
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Section, EditorContextType } from './types';
import { useSectionManager } from './useSectionManager';
import { usePanelManager } from './usePanelManager';
import { useProjectOperations } from './useProjectOperations';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children, projectName, template }: { 
  children: ReactNode; 
  projectName: string;
  template?: any;
}) {
  // Use our custom hooks
  const sectionManager = useSectionManager(projectName, template);
  const panelManager = usePanelManager();
  const projectOps = useProjectOperations(projectName);

  // Initialize editor state
  useEffect(() => {
    const { savedSections, savedTime } = projectOps.loadProject();
    
    if (savedSections.length > 0) {
      sectionManager.setSections(savedSections);
      projectOps.setLastSaved(savedTime);
      sectionManager.setActiveSection(savedSections[0].id);
    } else {
      sectionManager.initializeFromTemplateOrDefault();
    }
    
    panelManager.initializePanelState();
  }, [projectName, template]);

  // Create wrapped functions that use our hooks
  const saveProject = () => {
    projectOps.saveProject(sectionManager.sections);
  };

  const exportDocument = async (format: string) => {
    await projectOps.exportDocument(sectionManager.sections, format);
  };

  return (
    <EditorContext.Provider
      value={{
        // State
        sections: sectionManager.sections,
        activeSection: sectionManager.activeSection,
        lastSaved: projectOps.lastSaved,
        showCitationsPanel: panelManager.showCitationsPanel,
        showPdfReaderPanel: panelManager.showPdfReaderPanel,
        wordCount: sectionManager.wordCount,
        readingTime: sectionManager.readingTime,
        
        // Actions
        setSections: sectionManager.setSections,
        setActiveSection: sectionManager.setActiveSection,
        createSection: sectionManager.createSection,
        updateSectionContent: sectionManager.updateSectionContent,
        getCurrentSectionContent: sectionManager.getCurrentSectionContent,
        getCurrentSectionTitle: sectionManager.getCurrentSectionTitle,
        toggleCitationsPanel: panelManager.toggleCitationsPanel,
        togglePdfReaderPanel: panelManager.togglePdfReaderPanel,
        saveProject,
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
