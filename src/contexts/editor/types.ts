
export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface EditorState {
  sections: Section[];
  activeSection: string;
  lastSaved: Date | null;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  wordCount: number;
  readingTime: number;
}

export interface EditorActions {
  // Section management
  setSections: (sections: Section[]) => void;
  setActiveSection: (sectionId: string) => void;
  createSection: (title: string) => void;
  updateSectionContent: (content: string) => void;
  getCurrentSectionContent: () => string;
  getCurrentSectionTitle: () => string;
  
  // UI state management
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
  
  // Content management
  saveProject: () => void;
  exportDocument: (format: string) => Promise<void>;
  addContentToActiveSection: (content: string) => void;
  insertCitation: (citation: string) => void;
}

export interface EditorContextType extends EditorState, EditorActions {}
