
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PdfUploaderProps {
  onPdfLoaded: (pdfName: string, pdfContent: string) => void;
}

export function PdfUploader({ onPdfLoaded }: PdfUploaderProps) {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept PDF files
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
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
        title: "PDF uploaded",
        description: `"${file.name}" has been uploaded and analyzed.`,
      });
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => document.getElementById('pdf-file-upload')?.click()}
      >
        <FileUp className="h-4 w-4 mr-2" />
        Upload PDF
      </Button>
      <input
        id="pdf-file-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </>
  );
}
