
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Download, Save, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface EditorToolbarProps {
  onClose: () => void;
}

export function EditorToolbar({ onClose }: EditorToolbarProps) {
  const {
    saveProject,
    exportDocument,
    lastSaved,
    wordCount,
    readingTime,
    isAutoSaving,
  } = useEditor();
  
  const [isExporting, setIsExporting] = useState(false);
  const isOnline = useOnlineStatus();
  
  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await exportDocument(format);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Button 
          variant="default" 
          onClick={() => saveProject()}
          disabled={isAutoSaving}
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleExport("docx")}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-1" />
          Export DOCX
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-1" />
          Export PDF
        </Button>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <WifiOff className="w-4 h-4 text-destructive mr-1" />
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
        
        <div className="hidden sm:block">
          {isAutoSaving ? (
            <span className="text-muted-foreground">Saving...</span>
          ) : (
            lastSaved && (
              <span className="text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )
          )}
        </div>
        
        <div className="hidden md:block text-muted-foreground">
          {wordCount} words · {readingTime} min read
        </div>
      </div>
    </div>
  );
}
