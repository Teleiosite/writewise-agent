
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
  PenTool,
  Sparkles
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
  showAnalysisPanel: boolean;
  analysisTab: string;
  toggleAnalysisPanel: (tab?: string) => void;
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
  showAnalysisPanel,
  analysisTab,
  toggleAnalysisPanel
}: EditorHeaderProps) {
  
  // Navigation mapping to ensure we use the correct tab values
  const primaryNav = [
    { label: "Editor", value: "editor", icon: <Layout className="h-3.5 w-3.5" /> },
    { label: "Assistance", value: "assistant", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { label: "AI Detector", value: "ai-detector", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { label: "Analytics", value: "stats", icon: <BarChart2 className="h-3.5 w-3.5" /> },
    { label: "Humanizer", value: "humanizer", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  // MS Word-style Analysis Controls (Integrated into top header)
  const analysisNav = [
    { label: "Writing", value: "writing", icon: <PenTool className="h-3.5 w-3.5" /> },
    { label: "Grammar", value: "grammar", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  const secondaryNav = [
    { label: "Citations", value: "citations", action: toggleCitationsPanel, icon: <BookOpen className="h-3.5 w-3.5" /> },
    { label: "PDF Reader", value: "pdf-reader", action: togglePdfReaderPanel, icon: <FileText className="h-3.5 w-3.5" /> },
    { label: "PDF Chat", value: "pdf-chat", action: togglePdfChatPanel, icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { label: "Goals", value: "goals", value_internal: "goals", icon: <Target className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-col border-b bg-white dark:bg-gray-900 px-4 py-2 print:hidden shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Top Row: Title and Icons */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Enhanced Back Button */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-9 w-9 text-gray-500 transition-transform active:scale-95"
              title="Back to Projects"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="p-1.5 bg-blue-600 rounded-lg ml-1 hidden sm:block shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded-md -ml-2 transition-all">
                {title}
              </span>
              <div className="hidden md:flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors" />
                <FolderOpen className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Menu Row: Functional Navigation */}
            <div className="flex items-center gap-1 md:gap-3 text-[13.5px] overflow-x-auto no-scrollbar py-0.5">
              {primaryNav.map(item => (
                <button 
                  key={item.value} 
                  onClick={() => setActiveTab(item.value)}
                  className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md transition-all whitespace-nowrap active:scale-95
                    ${activeTab === item.value 
                      ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800/50' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />

              {/* Consolidated AI Tools Dropdown (Word-style) */}
              {activeTab === 'editor' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md transition-all whitespace-nowrap active:scale-95
                        ${showAnalysisPanel 
                          ? 'bg-orange-50 text-orange-700 font-bold dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-100 dark:ring-orange-800/50' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="hidden lg:inline text-[12px] ml-0.5">AI Tools</span>
                      <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200 dark:border-gray-800">
                    <div className="px-2 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/20 mb-1">AI Assistant & Writing</div>
                    
                    <DropdownMenuItem 
                      onClick={() => toggleAnalysisPanel("writing")}
                      className={`flex items-center gap-2.5 py-2 cursor-pointer ${analysisTab === 'writing' && showAnalysisPanel ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700' : ''}`}
                    >
                      <PenTool className="h-4 w-4" />
                      <span className="font-medium text-sm">Writing Suggestions</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => toggleAnalysisPanel("grammar")}
                      className={`flex items-center gap-2.5 py-2 cursor-pointer ${analysisTab === 'grammar' && showAnalysisPanel ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700' : ''}`}
                    >
                      <Zap className="h-4 w-4" />
                      <span className="font-medium text-sm">Grammar Analysis</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => toggleAnalysisPanel("generate")}
                      className={`flex items-center gap-2.5 py-2 cursor-pointer ${analysisTab === 'generate' && showAnalysisPanel ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700' : ''}`}
                    >
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Generate Sections (Ch. 1-5)</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer py-2 px-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                      <Zap className="h-3.5 w-3.5 mr-2 fill-blue-600/10" />
                      Academic Master Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Secondary Features Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">
                    <MoreHorizontal className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 shadow-xl border-gray-200 dark:border-gray-800">
                  <div className="px-2 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/20 mb-1">Features & Tools</div>
                  {secondaryNav.map(item => (
                    <DropdownMenuItem 
                      key={item.label}
                      onClick={() => {
                        if (item.action) item.action();
                        if (item.value_internal) setActiveTab(item.value_internal);
                      }}
                      className="flex items-center gap-2.5 py-2 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-700 dark:focus:text-blue-400"
                    >
                      <div className="text-gray-500 group-focus:text-blue-600">{item.icon}</div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer py-2 px-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                    <Zap className="h-3.5 w-3.5 mr-2 fill-blue-600/10" />
                    Premium AI Insights
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
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
