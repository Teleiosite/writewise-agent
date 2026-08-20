import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { PdfDocumentMeta, PdfPageData } from "./types";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfUploaderProps {
  onPdfLoaded: (docMeta: PdfDocumentMeta) => void;
  compact?: boolean;
}

export function PdfUploader({ onPdfLoaded, compact = false }: PdfUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (file.size > 25 * 1024 * 1024) {
        throw new Error("File size exceeds 25MB limit");
      }
      
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error("Please upload a valid PDF document");
      }
      
      const arrayBuffer = await file.arrayBuffer();
      // Clone buffer because PDF.js might detach the original
      const bufferForRender = arrayBuffer.slice(0);
      const bufferForParse = arrayBuffer.slice(0);

      const pdf = await pdfjsLib.getDocument({ data: bufferForParse }).promise;
      
      const pages: PdfPageData[] = [];
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        pages.push({ pageNumber: i, text: pageText });
        fullText += `--- Page ${i} ---\n` + pageText + "\n\n";
      }
      
      const docMeta: PdfDocumentMeta = {
        name: file.name,
        numPages: pdf.numPages,
        fullText: fullText.trim(),
        pages,
        rawBuffer: bufferForRender
      };

      onPdfLoaded(docMeta);
      
      toast.success(`Loaded "${file.name}" (${pdf.numPages} pages indexed for deep Q&A)`);
      setIsLoading(false);
    } catch (err: any) {
      console.error("PDF upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload PDF";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => document.getElementById('pdf-file-upload-input')?.click()}
        disabled={isLoading}
        className="rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase tracking-wider h-8 gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        aria-label="Upload PDF file"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileUp className="h-3.5 w-3.5" />
        )}
        {isLoading ? "Indexing Pages..." : compact ? "Upload PDF" : "Open Research PDF"}
      </Button>
      <input
        id="pdf-file-upload-input"
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileUpload}
        aria-label="PDF file input"
      />
      
      {error && (
        <div className="text-red-600 dark:text-red-400 flex items-center text-xs font-mono mt-1">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
