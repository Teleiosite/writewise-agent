
import { FileText, BookOpen, MessageSquare, Share2, Star, FolderOpen, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../editor/pdf/components/ThemeToggle";
import { Input } from "@/components/ui/input";

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
  const menuItems = ["File", "Edit", "View", "Insert", "Format", "Tools", "Gemini", "Help"];

  return (
    <div className="flex flex-col border-b bg-white dark:bg-gray-900 px-4 py-2 print:hidden">
      {/* Top Row: Title and Icons */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-blue-600 rounded">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 px-2 rounded -ml-2">{title}</span>
              <Star className="h-4 w-4 text-gray-400 cursor-pointer hover:text-yellow-400" />
              <FolderOpen className="h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-500" />
            </div>
            {/* Menu Row */}
            <div className="flex items-center gap-4 text-[13px] text-gray-600 dark:text-gray-400">
              {menuItems.map(item => (
                <span 
                  key={item} 
                  className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded transition-colors ${item === 'Gemini' ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-full gap-2 px-4 border-gray-300 dark:border-gray-700">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          <Button className="bg-blue-600 hover:bg-blue-700 transition-all rounded-full gap-2 px-6 shadow-md shadow-blue-200 dark:shadow-none">
            <Share2 className="h-4 w-4" />
            <span className="font-semibold">Share</span>
          </Button>
          
          <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner">
            U
          </div>
        </div>
      </div>

      {/* Floating Side Panel Buttons (Transferred from main layout toggle) */}
      <div className="hidden">
           {/* These are internal triggers we keep for backward compatibility with the existing dash functionality */}
           <Button onClick={togglePdfReaderPanel} size="sm" variant={showPdfReaderPanel ? "default" : "outline"}><FileText /></Button>
           <Button onClick={togglePdfChatPanel} size="sm" variant={showPdfChatPanel ? "default" : "outline"}><MessageSquare /></Button>
           <Button onClick={toggleCitationsPanel} size="sm" variant={showCitationsPanel ? "default" : "outline"}><BookOpen /></Button>
      </div>
    </div>
  );
}
