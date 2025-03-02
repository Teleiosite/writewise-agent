
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Section, EditorState } from './types';
import { calculateWordCount, calculateReadingTime, createSectionFromTitle, getSectionById, getDefaultSections } from './editorUtils';
import { saveProjectToStorage, loadProjectFromStorage, loadUserPreferences } from './editorStorage';

interface EditorContextType extends EditorState {
  // Actions
  setSections: (sections: Section[]) => void;
  setActiveSection: (sectionId: string) => void;
  createSection: (title: string) => void;
  updateSectionContent: (content: string) => void;
  getCurrentSectionContent: () => string;
  getCurrentSectionTitle: () => string;
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
  saveProject: () => void;
  exportDocument: (format: string) => Promise<void>;
  addContentToActiveSection: (content: string) => void;
  insertCitation: (citation: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children, projectName, template }: { 
  children: ReactNode; 
  projectName: string;
  template?: any;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const { toast } = useToast();

  // Initialize editor state
  useEffect(() => {
    const { sections: savedSections, lastSaved: savedTime } = loadProjectFromStorage(projectName);
    
    if (savedSections.length > 0) {
      setSections(savedSections);
      setLastSaved(savedTime);
      setActiveSection(savedSections[0].id);
    } else {
      initializeFromTemplateOrDefault();
    }
    
    const { showCitations, showPdfReader } = loadUserPreferences();
    if (showCitations) {
      setShowCitationsPanel(true);
    }
    
    if (showPdfReader) {
      setShowPdfReaderPanel(true);
    }
  }, [projectName, template]);

  // Update word count and reading time when active section changes
  useEffect(() => {
    if (!activeSection) return;
    
    const section = getSectionById(sections, activeSection);
    if (section) {
      const words = calculateWordCount(section.content);
      setWordCount(words);
      setReadingTime(calculateReadingTime(words));
    }
  }, [activeSection, sections]);

  const initializeFromTemplateOrDefault = () => {
    if (template && template.sections && Array.isArray(template.sections) && template.sections.length > 0) {
      const initialSections = template.sections.map((title: string) => createSectionFromTitle(title));
      
      setSections(initialSections);
      
      if (initialSections.length > 0) {
        setActiveSection(initialSections[0].id);
      }
    } else {
      const defaultSections = getDefaultSections();
      setSections(defaultSections);
      setActiveSection(defaultSections[0].id);
    }
  };

  const updateSectionContent = (content: string) => {
    if (!activeSection) return;
    
    setSections(sections.map(section => 
      section.id === activeSection ? { ...section, content } : section
    ));
  };

  const getCurrentSectionContent = (): string => {
    const section = getSectionById(sections, activeSection);
    return section ? section.content : "";
  };

  const getCurrentSectionTitle = (): string => {
    const section = getSectionById(sections, activeSection);
    return section ? section.title : "";
  };

  const toggleCitationsPanel = () => {
    setShowCitationsPanel(!showCitationsPanel);
    if (showCitationsPanel) setShowPdfReaderPanel(false);
  };

  const togglePdfReaderPanel = () => {
    setShowPdfReaderPanel(!showPdfReaderPanel);
    if (showPdfReaderPanel) setShowCitationsPanel(false);
  };

  const saveProject = () => {
    const currentTime = saveProjectToStorage(projectName, sections);
    setLastSaved(currentTime);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved successfully.",
    });
  };

  const exportDocument = async (format: string) => {
    const { downloadDocument, formatContent } = await import("@/utils/documentExport");
    const content = await formatContent(sections, format as any);
    await downloadDocument(content, projectName, format as any);
    toast({
      title: "Document exported",
      description: `Your document has been exported as ${format.toUpperCase()}`,
    });
  };

  const createSection = (title: string) => {
    const newSection = createSectionFromTitle(title);
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const addContentToActiveSection = (content: string) => {
    if (!activeSection) return;
    
    const currentSection = getSectionById(sections, activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n\n" + content;
      updateSectionContent(newContent);
      
      toast({
        title: "Content added",
        description: "New content has been added to your document.",
      });
    }
  };

  const insertCitation = (citation: string) => {
    if (!activeSection) return;
    
    const currentSection = getSectionById(sections, activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n" + citation;
      updateSectionContent(newContent);
    }
  };

  return (
    <EditorContext.Provider
      value={{
        sections,
        activeSection,
        lastSaved,
        showCitationsPanel,
        showPdfReaderPanel,
        wordCount,
        readingTime,
        setSections,
        setActiveSection,
        createSection,
        updateSectionContent,
        getCurrentSectionContent,
        getCurrentSectionTitle,
        toggleCitationsPanel,
        togglePdfReaderPanel,
        saveProject,
        exportDocument,
        addContentToActiveSection,
        insertCitation
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
