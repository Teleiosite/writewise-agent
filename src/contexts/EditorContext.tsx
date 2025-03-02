import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Section {
  id: string;
  title: string;
  content: string;
}

interface EditorContextType {
  // Editor state
  sections: Section[];
  activeSection: string;
  lastSaved: Date | null;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  wordCount: number;
  readingTime: number;
  
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

  useEffect(() => {
    const savedContent = localStorage.getItem(`draft-${projectName}`);
    
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setSections(parsed.sections || []);
        setLastSaved(new Date(parsed.lastSaved));
        if (parsed.sections && parsed.sections.length > 0) {
          setActiveSection(parsed.sections[0].id);
        }
      } catch (error) {
        console.error("Error parsing saved content:", error);
        initializeFromTemplateOrDefault();
      }
    } else {
      initializeFromTemplateOrDefault();
    }
    
    const shouldShowCitations = localStorage.getItem("show-citation-manager") === "true";
    if (shouldShowCitations) {
      setShowCitationsPanel(true);
      localStorage.removeItem("show-citation-manager");
    }
    
    const shouldShowPdfReader = localStorage.getItem("show-pdf-reader") === "true";
    if (shouldShowPdfReader) {
      setShowPdfReaderPanel(true);
      localStorage.removeItem("show-pdf-reader");
    }
  }, [projectName, template]);

  useEffect(() => {
    if (!activeSection) return;
    
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      const words = section.content.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 200));
    }
  }, [activeSection, sections]);

  const initializeFromTemplateOrDefault = () => {
    if (template && template.sections && Array.isArray(template.sections) && template.sections.length > 0) {
      const initialSections = template.sections.map((title: string) => ({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        content: "",
      }));
      
      setSections(initialSections);
      
      if (initialSections.length > 0) {
        setActiveSection(initialSections[0].id);
      }
    } else {
      initializeDefaultSections();
    }
  };

  const initializeDefaultSections = () => {
    const defaultSections: Section[] = [
      { id: "main-content", title: "Main Content", content: "" }
    ];
    setSections(defaultSections);
    setActiveSection("main-content");
  };

  const updateSectionContent = (content: string) => {
    if (!activeSection) return;
    
    setSections(sections.map(section => 
      section.id === activeSection ? { ...section, content } : section
    ));
  };

  const getCurrentSectionContent = (): string => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.content : "";
  };

  const getCurrentSectionTitle = (): string => {
    const section = sections.find(s => s.id === activeSection);
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
    const currentTime = new Date();
    const saveData = {
      sections,
      lastSaved: currentTime.toISOString(),
    };
    localStorage.setItem(`draft-${projectName}`, JSON.stringify(saveData));
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
    const id = title.toLowerCase().replace(/\s+/g, '-');
    const newSection = {
      id,
      title,
      content: ""
    };
    setSections([...sections, newSection]);
    setActiveSection(id);
  };

  const addContentToActiveSection = (content: string) => {
    if (!activeSection) return;
    
    const currentSection = sections.find(s => s.id === activeSection);
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
    
    const currentSection = sections.find(s => s.id === activeSection);
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
