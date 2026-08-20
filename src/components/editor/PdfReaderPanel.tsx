import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, MessageSquare, BookOpen, Upload, Maximize2, 
  Minimize2, ExternalLink, Sparkles, X 
} from "lucide-react";
import { PdfUploader } from "./pdf/PdfUploader";
import { PdfVisualViewer } from "./pdf/PdfVisualViewer";
import { PdfChatInterface } from "./pdf/PdfChatInterface";
import { PdfDocumentMeta } from "./pdf/types";
import { AcademicCitation } from "@/services/citationEngine";

interface PdfReaderPanelProps {
  onAddContent: (content: string) => void;
  onAddCitationToLibrary?: (citation: AcademicCitation) => void;
}

export function PdfReaderPanel({ onAddContent, onAddCitationToLibrary }: PdfReaderPanelProps) {
  const [docMeta, setDocMeta] = useState<PdfDocumentMeta | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handlePdfLoaded = (meta: PdfDocumentMeta) => {
    setDocMeta(meta);
    setCurrentPage(1);
  };

  const handleQuoteSelected = (quote: string, pageNum: number) => {
    const citation = docMeta?.name ? ` (Source: ${docMeta.name.replace(/\.pdf$/i, '')}, p. ${pageNum})` : ` (p. ${pageNum})`;
    onAddContent(`\n\n> "${quote}"${citation}\n\n`);
  };

  const handlePageJump = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  return (
    <Card className={`rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none flex flex-col ${
      isExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-white dark:bg-black' : 'h-[640px]'
    }`}>
      {/* Top Header Bar */}
      <div className="p-3 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="mono-badge text-[10px] shrink-0">PDF Suite</span>
          <h3 className="text-xs font-bold text-black dark:text-white truncate font-mono">
            {docMeta ? docMeta.name : "Literature Reader & Empirical Chat"}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PdfUploader onPdfLoaded={handlePdfLoaded} compact />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0 rounded-none text-zinc-600 dark:text-zinc-400"
            title={isExpanded ? "Restore Normal View" : "Expand Full Screen"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      {docMeta ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left: High-Fidelity Visual PDF Canvas (60% width) */}
          <div className="md:col-span-7 h-full border-r border-black dark:border-zinc-800 overflow-hidden flex flex-col">
            <PdfVisualViewer
              pdfData={docMeta.rawBuffer || null}
              numPages={docMeta.numPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onQuoteSelectedText={handleQuoteSelected}
            />
          </div>

          {/* Right: Academic AI Literature Assistant (40% width) */}
          <div className="md:col-span-5 h-full overflow-hidden flex flex-col">
            <PdfChatInterface
              docMeta={docMeta}
              onAddContent={onAddContent}
              onPageJump={handlePageJump}
              onAddCitationToLibrary={onAddCitationToLibrary}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/50 font-sans space-y-4">
          <div className="w-12 h-12 rounded-none border border-black dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-black dark:text-white" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-black dark:text-white font-mono uppercase tracking-wider">
              No Research Paper Loaded
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Upload any PDF journal article, thesis, or preprint. WriteWise will visually render the document and allow you to ask page-cited empirical questions and extract literature review summaries with 1 click.
            </p>
          </div>

          <PdfUploader onPdfLoaded={handlePdfLoaded} />
        </div>
      )}
    </Card>
  );
}
