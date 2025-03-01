
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PdfReaderPanelProps {
  onAddContent: (content: string) => void;
}

export function PdfReaderPanel({ onAddContent }: PdfReaderPanelProps) {
  const [pdfContent, setPdfContent] = useState<string>("");
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
      setPdfContent(`[PDF Content Extracted from: ${file.name}]
      
This would be the actual content extracted from the PDF document. In a real application, the PDF would be parsed and its text content would be extracted here.

The system would analyze headings, paragraphs, tables, and other elements to provide structured content that you can work with.

Key information such as:
- Authors: John Smith, Jane Doe
- Publication date: October 2023
- Abstract: The study investigates the effects of climate change on coastal ecosystems...

You can select any portion of this text to add to your document, or click "Add to Document" to include the entire extracted content in your current section.`);
      
      toast({
        title: "PDF uploaded",
        description: `"${file.name}" has been uploaded and analyzed.`,
      });
    };
    reader.readAsText(file);
  };

  const handleAddPdfContent = () => {
    if (!pdfContent) return;
    onAddContent(pdfContent);
    
    toast({
      title: "Content added",
      description: "PDF content has been added to your document.",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">PDF Reader</h3>
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
        </div>
        
        {pdfContent ? (
          <>
            <ScrollArea className="h-[200px] border rounded-md p-3">
              <div className="whitespace-pre-wrap">{pdfContent}</div>
            </ScrollArea>
            
            <Button 
              className="w-full"
              onClick={handleAddPdfContent}
            >
              Add to Document
            </Button>
          </>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">Upload a PDF file to extract and analyze its content.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
