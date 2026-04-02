
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Share2, 
  Star, 
  FolderOpen, 
  MoreHorizontal, 
  ArrowLeft,
  ChevronDown,
  Layout,
  BarChart2,
  Target,
  AlertTriangle,
  Zap,
  PanelLeft,
  PanelRight,
  Sparkles,
  Search,
  CheckCircle2,
  ListRestart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../editor/pdf/components/ThemeToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface EditorHeaderProps {
  title: string;
  showCitationsPanel: boolean;
  showPdfReaderPanel: boolean;
  showPdfChatPanel: boolean;
  toggleCitationsPanel: () => void;
  togglePdfReaderPanel: () => void;
  togglePdfChatPanel: () => void;
  onClose?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
  setShowRightSidebar: (show: boolean) => void;
  setActiveAiTab: (tab: string) => void;
  triggerAiAction: (tool: string) => void;
}

export function EditorHeader({
  title,
  showCitationsPanel,
  showPdfReaderPanel,
  showPdfChatPanel,
  toggleCitationsPanel,
  togglePdfReaderPanel,
  togglePdfChatPanel,
  onClose,
  activeTab,
  setActiveTab,
  showLeftSidebar,
  showRightSidebar,
  setShowLeftSidebar,
  setShowRightSidebar,
  setActiveAiTab,
  triggerAiAction
}: EditorHeaderProps) {
  const [showAiSubmenu, setShowAiSubmenu] = useState(false);
  
  // Navigation mapping to ensure we use the correct tab values
  const mainNav = [
    { label: "Editor", value: "editor", icon: <Layout className="h-3.5 w-3.5" /> },
    { label: "Assistance", value: "assistant", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { label: "AI Detector", value: "ai-detector", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { label: "Analytics", value: "stats", icon: <BarChart2 className="h-3.5 w-3.5" /> },
    { label: "Humanizer", value: "humanizer", icon: <Zap className="h-3.5 w-3.5" /> },
    { type: "separator" },
    { label: "Writing", value: "writing", isAi: true, icon: <Sparkles className="h-3.5 w-3.5" /> },
    { label: "Grammar", value: "grammar", isAi: true, icon: <Search className="h-3.5 w-3.5" /> },
    { label: "Generate", value: "generate", isAi: true, icon: <Sparkles className="h-3.5 w-3.5" /> },
    { type: "separator" },
    { label: "Citations", value: "citations", action: toggleCitationsPanel, icon: <BookOpen className="h-3.5 w-3.5" /> },
    { label: "PDF Reader", value: "pdf-reader", action: togglePdfReaderPanel, icon: <FileText className="h-3.5 w-3.5" /> },
    { label: "PDF Chat", value: "pdf-chat", action: togglePdfChatPanel, icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { label: "Goals", value: "goals", value_internal: "goals", icon: <Target className="h-3.5 w-3.5" /> },
  ];

  const handleAiToolClick = (toolValue: string) => {
    triggerAiAction(toolValue);
    if (!showRightSidebar) {
      setShowRightSidebar(true);
    }
  };

  return (
    <div className="flex flex-col border-b bg-white dark:bg-gray-900 px-4 py-1.5 print:hidden shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Top Row: Title and Icons */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 md:gap-3">
          {/* Sidebar Toggles & Back */}
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-8 w-8 text-gray-500"
              title="Back to Projects"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`rounded-full h-8 w-8 transition-colors ${!showLeftSidebar ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
              title={showLeftSidebar ? "Hide Sections" : "Show Sections"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-1 bg-blue-600 rounded-lg hidden sm:block shadow-sm">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 rounded-md -ml-1 transition-all">
                {title}
              </span>
              <div className="hidden md:flex items-center gap-1.5">
                <Star className="h-3 w-3 text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors" />
                <FolderOpen className="h-3 w-3 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Unified Menu Row */}
            <div className="flex items-center gap-0.5 md:gap-1 text-[12px] md:text-[13px] overflow-x-auto no-scrollbar py-0.5">
              {mainNav.map((item, idx) => {
                if (item.type === "separator") {
                  return <div key={`sep-${idx}`} className="w-px h-3.5 bg-gray-200 mx-1.5 lg:mx-2 shrink-0" />;
                }

                const isActive = item.isAi ? activeTab === 'editor' && true : activeTab === (item.value_internal || item.value);
                // For AI tools, they trigger an action but also "belong" to the editor view
                
                return (
                  <button 
                    key={item.value || item.label} 
                    onClick={() => {
                      if (item.isAi) {
                        handleAiToolClick(item.value!);
                        setActiveTab('editor'); // Ensure we are in editor mode
                      } else if (item.action) {
                        item.action();
                      } else if (item.value_internal) {
                        setActiveTab(item.value_internal);
                      } else if (item.value) {
                        setActiveTab(item.value);
                      }
                    }}
                    className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded-md transition-all whitespace-nowrap
                      ${isActive && !item.isAi
                        ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30' 
                        : item.isAi 
                          ? 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              {/* Context Overflow / Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded-md text-gray-500 hover:bg-gray-100 transition-all ml-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 shadow-xl border-gray-100">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Advanced Tools</div>
                  <DropdownMenuItem className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <Zap className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-medium">Power Search</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="font-medium">Version History</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`rounded-full h-9 w-9 transition-colors ${!showRightSidebar ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
            title={showRightSidebar ? "Hide Intelligence" : "Show Intelligence"}
          >
            <PanelRight className="h-4 w-4" />
          </Button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all rounded-full gap-1.5 md:gap-2 px-4 md:px-7 h-8 md:h-10 shadow-lg shadow-blue-200/50 dark:shadow-none border-0 active:scale-95">
            <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="font-bold text-xs md:text-sm">Share</span>
          </Button>
          
          <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all active:scale-90 border-2 border-white dark:border-gray-800">
            U
          </div>
        </div>
      </div>
    </div>
  );
}
