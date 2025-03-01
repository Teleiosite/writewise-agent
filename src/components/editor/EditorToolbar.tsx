
import { Button } from "@/components/ui/button";
import { Save, FileText, Quote, BookOpen, ChevronLeft, Clock, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "@/utils/documentExport";

interface EditorToolbarProps {
  onClose: () => void;
  onSave: () => void;
  onExport: (format: ExportFormat) => void;
  wordCount: number;
  readingTime: number;
  lastSaved: Date | null;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  onToggleCitations: () => void;
  onTogglePdfReader: () => void;
}

export function EditorToolbar({
  onClose,
  onSave,
  onExport,
  wordCount,
  readingTime,
  lastSaved,
  showCitationsPanel,
  showPdfReaderPanel,
  onToggleCitations,
  onTogglePdfReader,
}: EditorToolbarProps) {
  const formattedLastSaved = lastSaved 
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(lastSaved)
    : null;

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={onClose}
        className="group"
      >
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </Button>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min read</span>
          <span>•</span>
          <span>{wordCount} words</span>
          {formattedLastSaved && (
            <>
              <span>•</span>
              <span>Last saved at {formattedLastSaved}</span>
            </>
          )}
        </div>
        <Button 
          variant="outline"
          onClick={onSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport('txt')}>
              <Download className="mr-2 h-4 w-4" />
              Plain Text (.txt)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('md')}>
              <Download className="mr-2 h-4 w-4" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('html')}>
              <Download className="mr-2 h-4 w-4" />
              HTML (.html)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              PDF Document (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('doc')}>
              <Download className="mr-2 h-4 w-4" />
              Word Document (.docx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
