
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Section, EditorContextType } from './types';
import { useSectionManager } from './useSectionManager';
import { usePanelManager } from './usePanelManager';
import { useProjectOperations } from './useProjectOperations';
import { useAutoSave } from "@/hooks/useAutoSave";
import { loadProjectFromStorage, loadUserPreferences } from './editorStorage';

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor state
  useEffect(() => {
    const { sections: savedSections, lastSaved: savedTime } = loadProjectFromStorage(projectName);
    
    if (savedSections.length > 0) {
      sectionManager.setSections(savedSections);
      projectOps.setLastSaved(savedTime);
      sectionManager.setActiveSection(savedSections[0].id);
    } else {
      sectionManager.initializeFromTemplateOrDefault();
    }
    
    // Load user preferences
    const { showCitations, showPdfReader } = loadUserPreferences();
    
    if (showCitations) {
      panelManager.toggleCitationsPanel();
    }
    
    if (showPdfReader) {
      panelManager.togglePdfReaderPanel();
    }
    
    panelManager.initializePanelState();
    setIsInitialized(true);
  }, [projectName, template]);

  // Set up autosave
  const { lastSaved, isAutoSaving, manualSave } = useAutoSave(
    projectName,
    sectionManager.sections,
    projectOps.lastSaved
  );

  // Update last saved time from autosave
  useEffect(() => {
    if (lastSaved) {
      projectOps.setLastSaved(lastSaved);
    }
  }, [lastSaved]);

  // Create wrapped functions that use our hooks
  const saveProject = () => {
    manualSave();
  };

  const exportDocument = async (format: string) => {
    await projectOps.exportDocument(sectionManager.sections, format);
  };

  // Prevent rendering before initialization
  if (!isInitialized) {
    return <div className="w-full h-screen flex items-center justify-center">Loading document...</div>;
  }

  return (
    <EditorContext.Provider
      value={{
        // State
        sections: sectionManager.sections,
        activeSection: sectionManager.activeSection,
        lastSaved: projectOps.lastSaved,
        showCitationsPanel: panelManager.showCitationsPanel,
        showPdfReaderPanel: panelManager.showPdfReaderPanel,
        showPdfChatPanel: panelManager.showPdfChatPanel,
        wordCount: sectionManager.wordCount,
        readingTime: sectionManager.readingTime,
        isAutoSaving,
        
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
