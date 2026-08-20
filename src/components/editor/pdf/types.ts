export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  citedPages?: number[];
  isExtraction?: boolean;
}

export interface PdfPageData {
  pageNumber: number;
  text: string;
}

export interface PdfDocumentMeta {
  name: string;
  numPages: number;
  fullText: string;
  pages: PdfPageData[];
  rawBuffer?: ArrayBuffer;
}
