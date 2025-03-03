
import { Button } from "@/components/ui/button";
import { Quote, BookOpen } from "lucide-react";

interface EditorHeaderProps {
  title: string;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
}

export function EditorHeader({
  title,
  showCitationsPanel,
  showPdfReaderPanel,
  toggleCitationsPanel,
  togglePdfReaderPanel
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center space-x-2">
        <Button
          variant={showCitationsPanel ? "default" : "ghost"}
          size="sm"
          onClick={toggleCitationsPanel}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button 
          variant={showPdfReaderPanel ? "default" : "ghost"}
          size="sm"
          onClick={togglePdfReaderPanel}
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
