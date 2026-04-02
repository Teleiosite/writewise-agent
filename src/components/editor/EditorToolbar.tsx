
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { 
  Download, 
  Save, 
  Wifi, 
  WifiOff, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Eraser,
  Type
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function EditorToolbar() {
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

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };
  
  return (
    <div className="flex flex-col gap-2 p-3 bg-white border-b sticky top-0 z-10 shadow-sm print:hidden">
      {/* Top Row: Meta Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => saveProject()}
            disabled={isAutoSaving}
            className="text-blue-600 font-semibold"
          >
            <Save className="w-4 h-4 mr-1" />
            {isAutoSaving ? "Saving..." : "Save"}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleExport("docx")} disabled={isExporting}>
              <Download className="w-4 h-4 mr-1 text-blue-500" />
              DOCX
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")} disabled={isExporting}>
              <Download className="w-4 h-4 mr-1 text-red-500" />
              PDF
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground uppercase tracking-tight">
          <div className="flex items-center">
            {isOnline ? <Wifi className="w-3 h-3 text-green-500 mr-1" /> : <WifiOff className="w-3 h-3 text-red-500 mr-1" />}
            <span>{isOnline ? "Cloud Sync Active" : "Offline Mode"}</span>
          </div>
          {lastSaved && <span>Sync: {lastSaved.toLocaleTimeString()}</span>}
          <span>{wordCount} words</span>
        </div>
      </div>

      <Separator />

      {/* Bottom Row: Rich Text Formatting */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <div className="flex items-center bg-gray-50/50 p-1 rounded-md border border-gray-100">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('bold')} title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('italic')} title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('underline')} title="Underline">
            <Underline className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <div className="flex items-center bg-gray-50/50 p-1 rounded-md border border-gray-100">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('formatBlock', '<h1>')} title="Heading 1">
            <Type className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('justifyLeft')} title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('justifyCenter')} title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('justifyRight')} title="Align Right">
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <div className="flex items-center bg-gray-50/50 p-1 rounded-md border border-gray-100">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => execCommand('removeFormat')} title="Clear Formatting">
          <Eraser className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
