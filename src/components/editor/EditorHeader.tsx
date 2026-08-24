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
  Zap,
  PenTool,
  Sparkles,
  FlaskConical,
  Table,
  Presentation,
  ShieldCheck,
  Mail
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
  onOpenLiteratureMatrix?: () => void;
  onOpenDefenseDeck?: () => void;
  onOpenAcademicToneAuditor?: () => void;
  onOpenSupervisorEmail?: () => void;
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
  toggleAnalysisPanel,
  onOpenLiteratureMatrix,
  onOpenDefenseDeck,
  onOpenAcademicToneAuditor,
  onOpenSupervisorEmail
}: EditorHeaderProps) {
  
  const primaryNav = [
    { label: "Editor", value: "editor", icon: <Layout className="h-3.5 w-3.5" /> },
    { label: "Data Analysis", value: "data-analysis", icon: <FlaskConical className="h-3.5 w-3.5" /> },
    { label: "Assistance", value: "assistant", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-col border-b border-black dark:border-zinc-800 bg-white dark:bg-black px-4 py-2 print:hidden sticky top-0 z-50 font-sans shadow-none">
      {/* Top Row: Title and Icons */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-none h-8 w-8 text-black dark:text-white"
              title="Back to Workspaces"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="p-1.5 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none ml-1.5 hidden sm:block font-mono">
              <FileText className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold text-black dark:text-white cursor-pointer px-1 -ml-1">
                {title}
              </span>
              <div className="hidden md:flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                <FolderOpen className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
              </div>
            </div>

            {/* Menu Row: Functional Navigation */}
            <div className="flex items-center gap-1 md:gap-2 font-mono text-xs uppercase tracking-wider overflow-x-auto no-scrollbar py-0.5">
              {primaryNav.map(item => (
                <button 
                  key={item.value} 
                  onClick={() => setActiveTab(item.value)}
                  className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-none border transition-all whitespace-nowrap
                    ${activeTab === item.value 
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold' 
                      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-800 hover:text-black dark:hover:text-white'}`}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div className="w-px h-4 bg-black dark:bg-zinc-800 mx-1 hidden md:block" />

              {/* Citations & PDF Quick Action Buttons */}
              <button
                onClick={toggleCitationsPanel}
                className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-none border border-transparent text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-800 hover:text-black dark:hover:text-white transition-all whitespace-nowrap"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Citations</span>
              </button>

              <button
                onClick={togglePdfReaderPanel}
                className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-none border border-transparent text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-800 hover:text-black dark:hover:text-white transition-all whitespace-nowrap"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF Suite</span>
              </button>

              <div className="w-px h-4 bg-black dark:bg-zinc-800 mx-1 hidden md:block" />

              {/* Academic Research Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-none border border-transparent text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-800 hover:text-black dark:hover:text-white transition-all">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="text-xs hidden lg:inline font-bold">Research Tools</span>
                    <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 border border-black dark:border-zinc-800 bg-white dark:bg-black rounded-none font-mono text-xs shadow-lg">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-900 mb-1">Flagship Research Suites</div>
                  
                  {onOpenLiteratureMatrix && (
                    <DropdownMenuItem 
                      onClick={onOpenLiteratureMatrix}
                      className="flex items-center gap-2 py-2.5 cursor-pointer uppercase rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
                    >
                      <Table className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>Literature Matrix (Ch. 2)</span>
                    </DropdownMenuItem>
                  )}

                  {onOpenDefenseDeck && (
                    <DropdownMenuItem 
                      onClick={onOpenDefenseDeck}
                      className="flex items-center gap-2 py-2.5 cursor-pointer uppercase rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
                    >
                      <Presentation className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>Defense Slide Deck (.pptx)</span>
                    </DropdownMenuItem>
                  )}

                  {onOpenAcademicToneAuditor && (
                    <DropdownMenuItem 
                      onClick={onOpenAcademicToneAuditor}
                      className="flex items-center gap-2 py-2.5 cursor-pointer uppercase rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>Academic Rigor Scanner</span>
                    </DropdownMenuItem>
                  )}

                  {onOpenSupervisorEmail && (
                    <DropdownMenuItem 
                      onClick={onOpenSupervisorEmail}
                      className="flex items-center gap-2 py-2.5 cursor-pointer uppercase rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
                    >
                      <Mail className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>Email to Supervisor</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-black dark:bg-zinc-800" />
                  
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Assistant &amp; Guidance</div>
                  <DropdownMenuItem 
                    onClick={() => toggleAnalysisPanel("writing")}
                    className="flex items-center gap-2 py-2 cursor-pointer rounded-none uppercase"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>Writing Guidance</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => toggleAnalysisPanel("generate")}
                    className="flex items-center gap-2 py-2 cursor-pointer rounded-none uppercase"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Chapter Sections</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 font-mono">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <Button 
            onClick={onOpenSupervisorEmail}
            className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none gap-1.5 px-3 h-8 text-xs uppercase tracking-wider border border-black dark:border-white shadow-none"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="font-bold hidden sm:inline">Supervisor Memo</span>
          </Button>
          
          <div className="h-8 w-8 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none flex items-center justify-center font-bold text-xs cursor-pointer">
            U
          </div>
        </div>
      </div>
    </div>
  );
}
