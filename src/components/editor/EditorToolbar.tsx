
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Clock, 
  Save, 
  X, 
  Download, 
  Quote, 
  FileText,
  FileType,
  MessageSquare
} from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  onClose: () => void;
}

export function EditorToolbar({ onClose }: EditorToolbarProps) {
  const { 
    wordCount, 
    readingTime, 
    lastSaved, 
    saveProject, 
    exportDocument,
    showCitationsPanel,
    showPdfReaderPanel,
    toggleCitationsPanel,
    togglePdfReaderPanel
  } = useEditor();

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          
          <Button variant="ghost" size="sm" onClick={saveProject}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportDocument('pdf')}>
                <FileType className="h-4 w-4 mr-2" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportDocument('doc')}>
                <FileText className="h-4 w-4 mr-2" />
                Word Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={showCitationsPanel ? "default" : "ghost"}
            size="sm"
            onClick={toggleCitationsPanel}
          >
            <Quote className="h-4 w-4 mr-1" />
            Citations
          </Button>
          
          <Button
            variant={showPdfReaderPanel ? "default" : "ghost"}
            size="sm"
            onClick={togglePdfReaderPanel}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            <MessageSquare className="h-3 w-3 -mt-1" />
            Chat PDF
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {lastSaved && (
            <span className="text-xs">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            <span>{wordCount} words</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
