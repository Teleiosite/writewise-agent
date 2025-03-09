
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      
      // In a real app, this would parse the PDF content
      // For demo, we'll simulate extraction
      const reader = new FileReader();
      
      reader.onload = () => {
        // Set some sample extracted text
        const extractedContent = `[PDF Content Extracted from: ${file.name}]
        
This would be the actual content extracted from the PDF document. In a real application, the PDF would be parsed and its text content would be extracted here.

The system would analyze headings, paragraphs, tables, and other elements to provide structured content that you can work with.

Key information such as:
- Authors: John Smith, Jane Doe
- Publication date: October 2023
- Abstract: The study investigates the effects of climate change on coastal ecosystems...

You can select any portion of this text to add to your document, or click "Add to Document" to include the entire extracted content in your current section.`;
        
        onPdfLoaded(file.name, extractedContent);
        
        toast({
          title: "PDF uploaded successfully",
          description: `"${file.name}" has been uploaded and analyzed.`,
        });
        
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error("Failed to read the file");
      };
      
      reader.readAsText(file);
      
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
