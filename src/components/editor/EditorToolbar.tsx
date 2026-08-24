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
  Type,
  FileCode
} from "lucide-react";
import { useState } from "react";
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
            className={`h-7 w-7 p-0 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900 ${className}`} 
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] font-mono py-1 px-2 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white">
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
    <div className="flex flex-col gap-2 p-3 bg-white dark:bg-black border-b border-black dark:border-zinc-800 sticky top-0 z-10 font-sans print:hidden">
      {/* Top Row: Meta Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => saveProject()}
            disabled={isAutoSaving}
            className="text-black dark:text-white font-mono text-xs uppercase tracking-wider h-7 rounded-none border-black dark:border-zinc-800"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isAutoSaving ? "Saving..." : "Save"}
          </Button>
          
          <div className="w-px h-5 bg-black dark:bg-zinc-800 mx-1" />
          
          <div className="flex items-center gap-1 font-mono">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport("docx")} 
              disabled={isExporting}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              DOCX
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport("latex")} 
              disabled={isExporting}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5 bg-zinc-50 dark:bg-zinc-950 font-bold"
              title="Download Overleaf-ready LaTeX Package (.zip with main.tex & references.bib)"
            >
              <FileCode className="w-3.5 h-3.5" />
              LaTeX (.ZIP)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport("pdf")} 
              disabled={isExporting}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider font-bold">
          <div className="flex items-center border border-black dark:border-zinc-800 px-2 py-0.5 rounded-none bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white">
            {isOnline ? <Wifi className="w-3 h-3 mr-1.5 text-black dark:text-white" /> : <WifiOff className="w-3 h-3 mr-1.5 text-zinc-400" />}
            <span>{isOnline ? "CLOUD SYNC ACTIVE" : "OFFLINE"}</span>
          </div>
          {lastSaved && <span className="hidden md:inline text-zinc-500">SYNC: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <span className="border border-black dark:border-zinc-800 px-2 py-0.5 rounded-none bg-black text-white dark:bg-white dark:text-black">{wordCount} WORDS</span>
        </div>
      </div>

      <div className="h-px bg-black dark:bg-zinc-800 w-full my-0.5" />

      {/* Bottom Row: Rich Text Formatting */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-black dark:border-zinc-800">
          <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold className="w-3.5 h-3.5" />} title="Bold" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic className="w-3.5 h-3.5" />} title="Italic" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline className="w-3.5 h-3.5" />} title="Underline" />
        </div>

        <div className="w-px h-5 bg-black dark:bg-zinc-800 mx-0.5" />

        <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-black dark:border-zinc-800">
          <ToolbarButton onClick={() => execCommand('formatBlock', '<h1>')} icon={<Type className="w-3.5 h-3.5" />} title="Heading" />
          <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={<AlignLeft className="w-3.5 h-3.5" />} title="Align Left" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={<AlignCenter className="w-3.5 h-3.5" />} title="Align Center" />
          <ToolbarButton onClick={() => execCommand('justifyRight')} icon={<AlignRight className="w-3.5 h-3.5" />} title="Align Right" />
        </div>

        <div className="w-px h-5 bg-black dark:bg-zinc-800 mx-0.5" />

        <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-black dark:border-zinc-800">
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List className="w-3.5 h-3.5" />} title="Bullet List" />
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered className="w-3.5 h-3.5" />} title="Numbered List" />
        </div>
      </div>
    </div>
  );
}
