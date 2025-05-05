
import { ReactNode } from "react";

export interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface EditorContextType {
  // State
  sections: Section[];
  activeSection: string;
  lastSaved: Date | null;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  showPdfChatPanel: boolean;
  wordCount: number;
  readingTime: number;
  isAutoSaving?: boolean;
  
  // Actions
  setSections: (sections: Section[]) => void;
  setActiveSection: (id: string) => void;
  createSection: (title: string) => void;
  updateSectionContent: (content: string) => void;
  getCurrentSectionContent: () => string;
  getCurrentSectionTitle: () => string;
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
  togglePdfChatPanel: () => void;
  saveProject: () => void;
  exportDocument: (format: string) => Promise<void>;
  addContentToActiveSection: (content: string) => void;
  insertCitation: (citation: string) => void;
}

export interface EditorProviderProps {
  children: ReactNode;
  projectName: string;
  template?: any;
}
