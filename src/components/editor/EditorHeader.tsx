
import { MessageSquare, FileText, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCitationsPanel ? "default" : "outline"}
                size="sm"
                onClick={toggleCitationsPanel}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Citations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showPdfReaderPanel ? "default" : "outline"}
                size="sm"
                onClick={togglePdfReaderPanel}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>PDF Reader</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showPdfChatPanel ? "default" : "outline"}
                size="sm"
                onClick={togglePdfChatPanel}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat with PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
