
import { Section } from './types';

export const saveProjectToStorage = (projectName: string, sections: Section[]): Date => {
  const currentTime = new Date();
  const saveData = {
    sections,
    lastSaved: currentTime.toISOString(),
  };
  localStorage.setItem(`draft-${projectName}`, JSON.stringify(saveData));
  return currentTime;
};

export const loadProjectFromStorage = (projectName: string): { 
  sections: Section[]; 
  lastSaved: Date | null;
} => {
  const savedContent = localStorage.getItem(`draft-${projectName}`);
  
  if (savedContent) {
    try {
      const parsed = JSON.parse(savedContent);
      return { 
        sections: parsed.sections || [], 
        lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null 
      };
    } catch (error) {
      console.error("Error parsing saved content:", error);
      return { sections: [], lastSaved: null };
    }
  }
  
  return { sections: [], lastSaved: null };
};

export const loadUserPreferences = (): { 
  showCitations: boolean; 
  showPdfReader: boolean; 
} => {
  const shouldShowCitations = localStorage.getItem("show-citation-manager") === "true";
  const shouldShowPdfReader = localStorage.getItem("show-pdf-reader") === "true";
  
  // Clean up after reading
  if (shouldShowCitations) {
    localStorage.removeItem("show-citation-manager");
  }
  
  if (shouldShowPdfReader) {
    localStorage.removeItem("show-pdf-reader");
  }
  
  return {
    showCitations: shouldShowCitations,
    showPdfReader: shouldShowPdfReader
  };
};
