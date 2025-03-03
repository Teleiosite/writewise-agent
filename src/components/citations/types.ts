
export type CitationType = {
  id: string;
  title: string;
  authors: string[];
  year: string;
  source: string;
  type: "journal" | "book" | "conference" | "website";
  url?: string;
  doi?: string;
};

export type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";

export interface CitationManagerProps {
  onInsertCitation: (citation: string) => void;
}
