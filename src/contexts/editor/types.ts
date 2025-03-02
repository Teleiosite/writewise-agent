
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
