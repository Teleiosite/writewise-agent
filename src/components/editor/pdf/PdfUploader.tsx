import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onPdfLoaded: (pdfName: string, pdfContent: string) => void;
}

export function PdfUploader({ onPdfLoaded }: PdfUploaderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }
      
      // Only accept PDF files
      if (file.type !== "application/pdf") {
        throw new Error("Please upload a PDF file");
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }
      
      onPdfLoaded(file.name, fullText.trim());
      
      toast({
        title: "PDF uploaded successfully",
        description: `"${file.name}" has been uploaded and analyzed.`,
      });
      
      setIsLoading(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload PDF";
      setError(errorMessage);
      
      toast({
        title: "Error uploading PDF",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => document.getElementById('pdf-file-upload')?.click()}
        disabled={isLoading}
        className="flex items-center gap-1"
        aria-label="Upload PDF file"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4 mr-2" />
        )}
        {isLoading ? "Uploading..." : "Upload PDF"}
      </Button>
      <input
        id="pdf-file-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileUpload}
        aria-label="PDF file input"
      />
      
      {error && (
        <div className="text-destructive flex items-center text-sm mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </>
  );
}
