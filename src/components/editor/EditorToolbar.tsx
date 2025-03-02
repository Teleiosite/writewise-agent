
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, Save, X, Download, Quote, FileText } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";

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
          
          <Button variant="ghost" size="sm" onClick={() => exportDocument('docx')}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
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
            PDF Reader
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
