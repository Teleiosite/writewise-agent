
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare } from "lucide-react";
import { PdfUploader } from "./pdf/PdfUploader";
import { PdfContent } from "./pdf/PdfContent";
import { PdfChatInterface } from "./PdfChatInterface";

interface PdfReaderPanelProps {
  onAddContent: (content: string) => void;
}

export function PdfReaderPanel({ onAddContent }: PdfReaderPanelProps) {
  const [pdfContent, setPdfContent] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("pdf");

  const handlePdfLoaded = (name: string, content: string) => {
    setPdfName(name);
    setPdfContent(content);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">PDF Reader</h3>
          <PdfUploader onPdfLoaded={handlePdfLoaded} />
        </div>
        
        {pdfContent ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Content
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat PDF
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pdf" className="space-y-4">
              <PdfContent 
                pdfContent={pdfContent} 
                onAddContent={onAddContent} 
              />
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-4">
              <PdfChatInterface 
                onAddContent={onAddContent} 
                pdfContent={pdfContent} 
                pdfName={pdfName} 
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">Upload a PDF file to extract and analyze its content.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
