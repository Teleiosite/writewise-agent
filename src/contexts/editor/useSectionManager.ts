
import { useState, useEffect } from "react";
import { Section } from "./types";
import { createSectionFromTitle, getSectionById, getDefaultSections } from './editorUtils';
import { calculateWordCount, calculateReadingTime } from './editorUtils';

export function useSectionManager(projectName: string, template?: any) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

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

  return {
    sections,
    setSections,
    activeSection,
    setActiveSection,
    wordCount,
    readingTime,
    initializeFromTemplateOrDefault,
    updateSectionContent,
    getCurrentSectionContent,
    getCurrentSectionTitle,
    createSection,
    addContentToActiveSection,
    insertCitation
  };
}
