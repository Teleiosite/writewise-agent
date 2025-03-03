
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface PdfContentProps {
  pdfContent: string;
  onAddContent: (content: string) => void;
}

export function PdfContent({ pdfContent, onAddContent }: PdfContentProps) {
  const { toast } = useToast();

  const handleAddPdfContent = () => {
    if (!pdfContent) return;
    onAddContent(pdfContent);
    
    toast({
      title: "Content added",
      description: "PDF content has been added to your document.",
    });
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] border rounded-md p-3">
        <div className="whitespace-pre-wrap">{pdfContent}</div>
      </ScrollArea>
      
      <Button 
        className="w-full"
        onClick={handleAddPdfContent}
      >
        Add to Document
      </Button>
    </div>
  );
}
