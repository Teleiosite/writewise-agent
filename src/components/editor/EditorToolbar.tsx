
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  className?: string;
}

function ToolbarButton({ onClick, icon, title, className }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`} 
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] py-1 px-2">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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
    <div className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-900 border-b sticky top-0 z-10 shadow-sm print:hidden">
      {/* Top Row: Meta Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => saveProject()}
            disabled={isAutoSaving}
            className="text-blue-600 dark:text-blue-400 font-semibold h-8"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isAutoSaving ? "Saving..." : "Save"}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <ToolbarButton 
              onClick={() => handleExport("docx")} 
              icon={<Download className="w-4 h-4 text-blue-500" />} 
              title="Export as DOCX" 
            />
            <ToolbarButton 
              onClick={() => handleExport("pdf")} 
              icon={<Download className="w-4 h-4 text-red-500" />} 
              title="Export as PDF" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
            {isOnline ? <Wifi className="w-3 h-3 text-green-500 mr-1.5" /> : <WifiOff className="w-3 h-3 text-red-500 mr-1.5" />}
            <span>{isOnline ? "Cloud Sync Active" : "Offline"}</span>
          </div>
          {lastSaved && <span className="hidden md:inline">Sync: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">{wordCount} words</span>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Bottom Row: Rich Text Formatting */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/30 p-0.5 rounded-lg border border-gray-100 dark:border-gray-800">
          <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold className="w-4 h-4" />} title="Bold" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic className="w-4 h-4" />} title="Italic" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline className="w-4 h-4" />} title="Underline" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

        <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/30 p-0.5 rounded-lg border border-gray-100 dark:border-gray-800">
          <ToolbarButton onClick={() => execCommand('formatBlock', '<h1>')} icon={<Type className="w-4 h-4" />} title="Heading" />
          <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={<AlignLeft className="w-4 h-4" />} title="Align Left" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={<AlignCenter className="w-4 h-4" />} title="Align Center" />
          <ToolbarButton onClick={() => execCommand('justifyRight')} icon={<AlignRight className="w-4 h-4" />} title="Align Right" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

        <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/30 p-0.5 rounded-lg border border-gray-100 dark:border-gray-800">
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered className="w-4 h-4" />} title="Numbered List" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

        <ToolbarButton 
          onClick={() => execCommand('removeFormat')} 
          icon={<Eraser className="w-4 h-4" />} 
          title="Clear Formatting" 
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
        />
      </div>
    </div>
  );
}
