
import { FileText, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../editor/pdf/components/ThemeToggle";

interface EditorHeaderProps {
  title: string;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  showPdfChatPanel: boolean;
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
  togglePdfChatPanel: () => void;
}

export function EditorHeader({
  title,
  showCitationsPanel,
  showPdfReaderPanel,
  showPdfChatPanel,
  toggleCitationsPanel,
  togglePdfReaderPanel,
  togglePdfChatPanel
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant={showPdfReaderPanel ? "default" : "outline"}
          size="sm"
          onClick={togglePdfReaderPanel}
          aria-label="Toggle PDF Reader"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF Reader
        </Button>
        
        <Button
          variant={showPdfChatPanel ? "default" : "outline"}
          size="sm"
          onClick={togglePdfChatPanel}
          aria-label="Toggle PDF Chat"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          PDF Chat
        </Button>
        
        <Button
          variant={showCitationsPanel ? "default" : "outline"}
          size="sm"
          onClick={toggleCitationsPanel}
          aria-label="Toggle Citations"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Citations
        </Button>
      </div>
    </div>
  );
}
