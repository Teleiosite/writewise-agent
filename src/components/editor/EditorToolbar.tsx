import React, { useState, useMemo } from "react";
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
  Strikethrough,
  Subscript,
  Superscript,
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  FileCode,
  Printer,
  Undo2,
  Redo2,
  Table,
  Plus,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Quote,
  Search,
  Replace,
  Scissors,
  Copy,
  Check,
  ChevronDown,
  Highlighter,
  Baseline,
  Sigma,
  Calendar,
  Layers,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Indent,
  Outdent,
  RemoveFormatting,
  Divide,
  HelpCircle,
  Clock,
  Info
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { LiteratureMatrixModal } from "@/components/matrix/LiteratureMatrixModal";
import { AcademicToneAuditorModal } from "@/components/editor/AcademicToneAuditorModal";

type RibbonTab = "home" | "insert" | "layout" | "references" | "review";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ onClick, icon, title, className, active, disabled }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={disabled}
            className={`h-7 w-7 p-0 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900 border transition-all ${
              active 
                ? 'bg-zinc-200 dark:bg-zinc-800 border-black dark:border-white text-black dark:text-white font-bold' 
                : 'border-transparent text-zinc-700 dark:text-zinc-300'
            } ${className || ''}`} 
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] font-mono py-1 px-2 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white z-50">
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
    toggleCitationsPanel,
    toggleAnalysisPanel,
    getCurrentSectionContent,
    updateSectionContent,
    getCurrentSectionTitle,
    addContentToActiveSection,
    insertCitation
  } = useEditor();
  
  const [activeTab, setActiveTab] = useState<RibbonTab>("home");
  const [isExporting, setIsExporting] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showToneAuditorModal, setShowToneAuditorModal] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [currentFont, setCurrentFont] = useState("Times New Roman");
  const [currentFontSize, setCurrentFontSize] = useState("12pt");
  const [currentLineSpacing, setCurrentLineSpacing] = useState("2.0");

  const isOnline = useOnlineStatus();
  
  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await exportDocument(format);
    } finally {
      setIsExporting(false);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    // Dispatch input to ensure state update
    const editorEl = document.querySelector("[contenteditable='true']");
    if (editorEl) {
      editorEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      execCommand("insertHTML", html);
    }
    const editorEl = document.querySelector("[contenteditable='true']");
    if (editorEl) {
      editorEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // ── Table Insertion ──────────────────────────────────────────────────────────
  const insertTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-family: 'Times New Roman', serif; font-size: 11pt; border-top: 2px solid #000; border-bottom: 2px solid #000;">
      <thead>
        <tr style="border-bottom: 1px solid #000; background-color: #f8f9fa;">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th style="padding: 8px 12px; text-align: left; font-weight: bold; border-right: 1px solid #e2e8f0;">Column ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      tableHtml += `<tr style="border-bottom: 1px solid #edf2f7;">`;
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="padding: 8px 12px; border-right: 1px solid #edf2f7;">Data ${r},${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;
    insertHtmlAtCursor(tableHtml);
    toast.success(`Inserted ${rows}x${cols} APA 7th Academic Table`);
  };

  // ── Callout Box Insertion ───────────────────────────────────────────────────
  const insertCalloutBox = (type: "hypothesis" | "question" | "proposition" | "note") => {
    let html = "";
    if (type === "hypothesis") {
      html = `<div style="border-left: 4px solid #000; background-color: #f8fafc; padding: 12px 16px; margin: 16px 0; font-family: 'Times New Roman', serif; font-style: italic;">
        <strong>Hypothesis 1 (H₁):</strong> There is a statistically significant positive relationship between [Independent Variable] and [Dependent Variable] among the target population.
      </div><p><br></p>`;
    } else if (type === "question") {
      html = `<div style="border-left: 4px solid #2563eb; background-color: #eff6ff; padding: 12px 16px; margin: 16px 0; font-family: 'Times New Roman', serif;">
        <strong>Research Question 1 (RQ₁):</strong> To what extent does [Variable A] influence [Variable B] within the context of [Context/Region]?
      </div><p><br></p>`;
    } else if (type === "proposition") {
      html = `<div style="border-left: 4px solid #059669; background-color: #ecfdf5; padding: 12px 16px; margin: 16px 0; font-family: 'Times New Roman', serif; font-style: italic;">
        <strong>Proposition 1:</strong> In institutional environments characterized by [Condition], organizations that adopt [Strategy] achieve higher performance.
      </div><p><br></p>`;
    } else {
      html = `<div style="border: 1px solid #000; background-color: #fafafa; padding: 12px 16px; margin: 16px 0; font-family: 'Times New Roman', serif;">
        <strong>Note for Supervisor / Examiner:</strong> [Insert methodological clarification, scope delimitations, or ethical approval note here.]
      </div><p><br></p>`;
    }
    insertHtmlAtCursor(html);
    toast.success(`Inserted ${type.toUpperCase()} Box`);
  };

  // ── Academic Preset Application ──────────────────────────────────────────────
  const applyStylePreset = (preset: "apa" | "harvard" | "ieee") => {
    const editorEl = document.querySelector("[contenteditable='true']") as HTMLElement;
    if (!editorEl) return;
    if (preset === "apa") {
      editorEl.style.fontFamily = "'Times New Roman', Times, serif";
      editorEl.style.fontSize = "12pt";
      editorEl.style.lineHeight = "2.0";
      editorEl.style.textAlign = "left";
      setCurrentFont("Times New Roman");
      setCurrentFontSize("12pt");
      setCurrentLineSpacing("2.0");
      toast.success("Applied APA 7th Preset: Times New Roman 12pt · Double Spacing (2.0)");
    } else if (preset === "harvard") {
      editorEl.style.fontFamily = "Calibri, Arial, sans-serif";
      editorEl.style.fontSize = "11pt";
      editorEl.style.lineHeight = "1.5";
      editorEl.style.textAlign = "justify";
      setCurrentFont("Calibri");
      setCurrentFontSize("11pt");
      setCurrentLineSpacing("1.5");
      toast.success("Applied Harvard / UK Preset: Calibri 11pt · 1.5 Spacing · Justified");
    } else {
      editorEl.style.fontFamily = "Arial, Helvetica, sans-serif";
      editorEl.style.fontSize = "10.5pt";
      editorEl.style.lineHeight = "1.15";
      editorEl.style.textAlign = "justify";
      setCurrentFont("Arial");
      setCurrentFontSize("10.5pt");
      setCurrentLineSpacing("1.15");
      toast.success("Applied IEEE / STEM Preset: Arial 10.5pt · Single Spacing · Justified");
    }
  };

  // ── Math Symbol Insertion ───────────────────────────────────────────────────
  const insertSymbol = (sym: string) => {
    insertHtmlAtCursor(` ${sym} `);
  };

  // ── Find and Replace ────────────────────────────────────────────────────────
  const handleFindAndReplace = () => {
    if (!findQuery) {
      toast.error("Please enter a search word.");
      return;
    }
    const current = getCurrentSectionContent();
    if (!current.includes(findQuery)) {
      toast.error(`No occurrences of "${findQuery}" found.`);
      return;
    }
    const regex = new RegExp(findQuery, "gi");
    const count = (current.match(regex) || []).length;
    const updated = current.replaceAll(findQuery, replaceQuery);
    updateSectionContent(updated);
    toast.success(`Replaced ${count} occurrence(s) of "${findQuery}" with "${replaceQuery}"`);
    setShowFindReplace(false);
  };

  // ── Manuscript Stats Calculation ────────────────────────────────────────────
  const stats = useMemo(() => {
    const raw = getCurrentSectionContent();
    const clean = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const characters = clean.length;
    const charNoSpaces = clean.replace(/\s/g, "").length;
    const sentences = clean ? (clean.match(/[.!?]+/g) || []).length || 1 : 0;
    const paragraphs = raw ? (raw.match(/<p>|<div|<li>/gi) || []).length || 1 : 1;
    const minutes = Math.ceil(words / 220);
    return { words, characters, charNoSpaces, sentences, paragraphs, minutes };
  }, [getCurrentSectionContent]);

  return (
    <div className="flex flex-col bg-white dark:bg-black border-b border-black dark:border-zinc-800 sticky top-0 z-30 font-sans shadow-sm print:hidden select-none">
      
      {/* ── Top Bar: Meta Actions, File Exports & Word Metrics ───────────── */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 gap-2 bg-zinc-50/70 dark:bg-zinc-950/70">
        
        {/* Left: Quick Access File Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => saveProject()}
            disabled={isAutoSaving}
            className="text-black dark:text-white font-mono text-[11px] uppercase tracking-wider h-7 rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
          >
            <Save className="w-3 h-3 text-emerald-600" />
            {isAutoSaving ? "Saving..." : "Save"}
          </Button>

          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

          {/* Quick Undo / Redo */}
          <ToolbarButton onClick={() => execCommand("undo")} icon={<Undo2 className="w-3.5 h-3.5" />} title="Undo (Ctrl+Z)" />
          <ToolbarButton onClick={() => execCommand("redo")} icon={<Redo2 className="w-3.5 h-3.5" />} title="Redo (Ctrl+Y)" />

          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isExporting}
                className="h-7 text-[11px] font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
              >
                <Download className="w-3 h-3" />
                Export
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 font-mono text-xs z-50 bg-white dark:bg-black">
              <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500">Academic Manuscript Export</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("docx")} className="cursor-pointer gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Microsoft Word (.DOCX)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("latex")} className="cursor-pointer gap-2 font-bold">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" /> Overleaf LaTeX (.ZIP Package)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer gap-2">
                <Download className="w-3.5 h-3.5 text-rose-600" /> Formatted PDF (.PDF)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer gap-2">
                <Printer className="w-3.5 h-3.5" /> Print Manuscript
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Find & Replace Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`h-7 px-2 text-[11px] font-mono uppercase tracking-wider rounded-none gap-1 ${
              showFindReplace ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Search className="w-3 h-3" />
            Find
          </Button>
        </div>

        {/* Right: Cloud Sync Status & Metrics */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider font-bold">
          <div className="flex items-center border border-black dark:border-zinc-800 px-2 py-0.5 rounded-none bg-white dark:bg-black text-black dark:text-white">
            {isOnline ? <Wifi className="w-2.5 h-2.5 mr-1 text-emerald-600" /> : <WifiOff className="w-2.5 h-2.5 mr-1 text-zinc-400" />}
            <span className="hidden sm:inline">{isOnline ? "CLOUD SYNC" : "OFFLINE"}</span>
          </div>

          {lastSaved && (
            <span className="hidden lg:inline text-zinc-500 text-[9px]">
              SYNC: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          {/* Word Count Pill -> Opens Stats Modal */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="border border-black dark:border-zinc-700 px-2 py-0.5 rounded-none bg-black text-white dark:bg-white dark:text-black hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer"
            title="Click for full manuscript statistics"
          >
            <span>{wordCount} WORDS</span>
            <span className="opacity-60 text-[9px]">({readingTime}m)</span>
          </button>
        </div>
      </div>

      {/* ── Find & Replace Sub-Bar ───────────────────────────────────────── */}
      {showFindReplace && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 text-xs font-mono">
          <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Find text in section..."
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            className="h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono w-44 rounded-none"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono w-44 rounded-none"
          />
          <Button 
            size="sm" 
            onClick={handleFindAndReplace}
            className="h-7 rounded-none bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] uppercase px-3"
          >
            Replace All
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFindReplace(false)}
            className="h-7 px-2 text-[10px] font-mono text-zinc-500"
          >
            Close
          </Button>
        </div>
      )}

      {/* ── Ribbon Tabs Navigation Bar (Word / WPS Office Style) ────────── */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-2 bg-zinc-100/60 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider overflow-x-auto no-scrollbar">
        {[
          { id: "home", label: "Home", icon: <Type className="w-3 h-3" /> },
          { id: "insert", label: "Insert", icon: <Plus className="w-3 h-3" /> },
          { id: "layout", label: "Page Layout", icon: <Layers className="w-3 h-3" /> },
          { id: "references", label: "References", icon: <BookOpen className="w-3 h-3" /> },
          { id: "review", label: "Review & Integrity", icon: <ShieldCheck className="w-3 h-3" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as RibbonTab)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === tab.id
                ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-black shadow-sm"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Active Ribbon Content Panel ─────────────────────────────────── */}
      <div className="p-1.5 bg-white dark:bg-black overflow-x-auto no-scrollbar">
        
        {/* ── TAB 1: HOME (Main Formatting) ────────────────────────────── */}
        {activeTab === "home" && (
          <div className="flex items-center gap-1.5 min-w-max">
            
            {/* Font Family Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-1.5 h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-serif text-xs rounded-none hover:bg-zinc-100 min-w-[130px]">
                  <span className="truncate">{currentFont}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500">Academic Font Family</DropdownMenuLabel>
                {[
                  { name: "Times New Roman", style: "'Times New Roman', serif", desc: "APA 7th Standard" },
                  { name: "Calibri", style: "Calibri, sans-serif", desc: "Modern Clean" },
                  { name: "Arial", style: "Arial, sans-serif", desc: "Standard Sans" },
                  { name: "Georgia", style: "Georgia, serif", desc: "Editorial Serif" },
                  { name: "Garamond", style: "Garamond, serif", desc: "Traditional Thesis" },
                  { name: "Courier New", style: "Courier New, monospace", desc: "Code / Raw Data" }
                ].map((f) => (
                  <DropdownMenuItem
                    key={f.name}
                    onClick={() => {
                      execCommand("fontName", f.name);
                      setCurrentFont(f.name);
                    }}
                    className="flex items-center justify-between gap-3 cursor-pointer py-1.5"
                    style={{ fontFamily: f.style }}
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400 font-sans">{f.desc}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-1 h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs rounded-none hover:bg-zinc-100 min-w-[55px]">
                  <span>{currentFontSize}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono min-w-[80px]">
                {["9pt", "10pt", "11pt", "12pt (APA)", "14pt", "16pt (H3)", "18pt (H2)", "24pt (H1)", "32pt (Title)"].map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => {
                      const num = s.split("pt")[0];
                      execCommand("fontSize", num);
                      setCurrentFontSize(s.split(" ")[0]);
                    }}
                    className="cursor-pointer py-1"
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Character Styles: Bold, Italic, Underline, Strikethrough, Sub/Super */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-zinc-300 dark:border-zinc-700">
              <ToolbarButton onClick={() => execCommand("bold")} icon={<Bold className="w-3.5 h-3.5" />} title="Bold (Ctrl+B)" />
              <ToolbarButton onClick={() => execCommand("italic")} icon={<Italic className="w-3.5 h-3.5" />} title="Italic (Ctrl+I)" />
              <ToolbarButton onClick={() => execCommand("underline")} icon={<Underline className="w-3.5 h-3.5" />} title="Underline (Ctrl+U)" />
              <ToolbarButton onClick={() => execCommand("strikeThrough")} icon={<Strikethrough className="w-3.5 h-3.5" />} title="Strikethrough" />
              <ToolbarButton onClick={() => execCommand("subscript")} icon={<Subscript className="w-3.5 h-3.5" />} title="Subscript (X₂)" />
              <ToolbarButton onClick={() => execCommand("superscript")} icon={<Superscript className="w-3.5 h-3.5" />} title="Superscript (X²)" />
            </div>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Text Color Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 h-7 px-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none hover:bg-zinc-100">
                  <Baseline className="w-3.5 h-3.5 text-black dark:text-white" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Text Color</DropdownMenuLabel>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { color: "#000000", name: "Black" },
                    { color: "#1e3a8a", name: "Navy Blue" },
                    { color: "#991b1b", name: "Crimson" },
                    { color: "#065f46", name: "Dark Green" },
                    { color: "#475569", name: "Slate Gray" }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => execCommand("foreColor", c.color)}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                      className="w-5 h-5 border border-zinc-300 hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Highlight Marker Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 h-7 px-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none hover:bg-zinc-100">
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Highlight Color</DropdownMenuLabel>
                <div className="flex items-center gap-1">
                  {[
                    { color: "#fef08a", name: "Yellow" },
                    { color: "#bbf7d0", name: "Green" },
                    { color: "#bae6fd", name: "Cyan" },
                    { color: "#fbcfe8", name: "Pink" },
                    { color: "transparent", name: "Clear" }
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => execCommand("hiliteColor", c.color)}
                      style={{ backgroundColor: c.color === "transparent" ? "#ffffff" : c.color }}
                      title={c.name}
                      className="w-5 h-5 border border-zinc-400 hover:scale-110 transition-transform text-[8px] flex items-center justify-center font-mono"
                    >
                      {c.color === "transparent" ? "✕" : ""}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ToolbarButton onClick={() => execCommand("removeFormat")} icon={<RemoveFormatting className="w-3.5 h-3.5" />} title="Clear Formatting" />

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Alignments: Left, Center, Right, Justify */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-zinc-300 dark:border-zinc-700">
              <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={<AlignLeft className="w-3.5 h-3.5" />} title="Align Left" />
              <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={<AlignCenter className="w-3.5 h-3.5" />} title="Align Center" />
              <ToolbarButton onClick={() => execCommand("justifyRight")} icon={<AlignRight className="w-3.5 h-3.5" />} title="Align Right" />
              <ToolbarButton onClick={() => execCommand("justifyFull")} icon={<AlignJustify className="w-3.5 h-3.5" />} title="Justify (Full APA/Dissertation)" />
            </div>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Lists & Indents */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 p-0.5 border border-zinc-300 dark:border-zinc-700">
              <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={<List className="w-3.5 h-3.5" />} title="Bullet List" />
              <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={<ListOrdered className="w-3.5 h-3.5" />} title="Numbered List" />
              <ToolbarButton onClick={() => execCommand("outdent")} icon={<Outdent className="w-3.5 h-3.5" />} title="Decrease Indent" />
              <ToolbarButton onClick={() => execCommand("indent")} icon={<Indent className="w-3.5 h-3.5" />} title="Increase Indent" />
            </div>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Heading / Style Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-white dark:bg-black font-mono text-[11px] uppercase tracking-wider rounded-none hover:bg-zinc-100">
                  <span>Style</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono min-w-[150px]">
                <DropdownMenuItem onClick={() => execCommand("formatBlock", "<p>")} className="cursor-pointer">
                  Normal Text (Paragraph)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("formatBlock", "<h1>")} className="cursor-pointer font-bold text-base">
                  Heading 1 (Chapter Title)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("formatBlock", "<h2>")} className="cursor-pointer font-bold text-sm">
                  Heading 2 (Section Title)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("formatBlock", "<h3>")} className="cursor-pointer font-semibold">
                  Heading 3 (Subsection)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("formatBlock", "<blockquote>")} className="cursor-pointer italic text-zinc-600">
                  Blockquote / Excerpt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        )}

        {/* ── TAB 2: INSERT (Tables, Citations, Math, Callouts) ────────── */}
        {activeTab === "insert" && (
          <div className="flex items-center gap-1.5 min-w-max">
            
            {/* Table Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5">
                  <Table className="w-3.5 h-3.5" />
                  Table
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono p-2">
                <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 mb-1">Insert APA 7th Table</DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => insertTable(2, 2)} className="h-7 text-[10px] rounded-none">2 × 2 Grid</Button>
                  <Button variant="outline" size="sm" onClick={() => insertTable(3, 3)} className="h-7 text-[10px] rounded-none">3 × 3 Standard</Button>
                  <Button variant="outline" size="sm" onClick={() => insertTable(4, 4)} className="h-7 text-[10px] rounded-none">4 × 4 Matrix</Button>
                  <Button variant="outline" size="sm" onClick={() => insertTable(6, 5)} className="h-7 text-[10px] rounded-none">6 × 5 Data</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Academic Callout Boxes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  Callout Box
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono">
                <DropdownMenuItem onClick={() => insertCalloutBox("hypothesis")} className="cursor-pointer">
                  Hypothesis Box (H₁)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCalloutBox("question")} className="cursor-pointer">
                  Research Question (RQ₁)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCalloutBox("proposition")} className="cursor-pointer">
                  Theoretical Proposition
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCalloutBox("note")} className="cursor-pointer">
                  Methodological Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Math & Greek Symbols Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5">
                  <Sigma className="w-3.5 h-3.5" />
                  Symbols (α, β, χ²)
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2.5 max-w-xs">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">Statistical &amp; Greek Symbols</DropdownMenuLabel>
                <div className="grid grid-cols-6 gap-1 font-serif text-sm text-center">
                  {[
                    "α", "β", "γ", "δ", "ε", "θ",
                    "λ", "μ", "π", "σ", "τ", "χ²",
                    "Δ", "Σ", "Ω", "±", "≤", "≥",
                    "≠", "≈", "∞", "→", "R²", "η²",
                    "p < .05", "p < .01", "p < .001", "N = ", "t =", "F ="
                  ].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => insertSymbol(sym)}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* LaTeX Math Block */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertHtmlAtCursor(`<div style="background-color: #f1f5f9; padding: 10px 16px; border: 1px dashed #94a3b8; font-family: monospace; font-size: 11pt; margin: 12px 0; text-align: center;">$$ Y_i = \\beta_0 + \\beta_1 X_{1i} + \\beta_2 X_{2i} + \\epsilon_i $$</div><p><br></p>`)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              LaTeX Equation
            </Button>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-0.5" />

            {/* Page Break & Divider */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertHtmlAtCursor(`<div style="page-break-after: always; border-top: 2px dashed #94a3b8; margin: 24px 0; text-align: center; font-size: 9pt; color: #64748b; font-family: monospace;">--- [PAGE BREAK] ---</div><p><br></p>`)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5"
            >
              Page Break
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => execCommand("insertHorizontalRule")}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5"
            >
              Horizontal Rule
            </Button>

            {/* Date / Time stamp */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertHtmlAtCursor(`<strong>${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>`)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Date Stamp
            </Button>

          </div>
        )}

        {/* ── TAB 3: PAGE LAYOUT (1-Click Academic Standards) ──────────── */}
        {activeTab === "layout" && (
          <div className="flex items-center gap-2 min-w-max">
            
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold ml-1">1-Click Standards:</span>

            {/* APA 7th Edition Preset */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyStylePreset("apa")}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1.5 font-bold"
            >
              🎓 APA 7th (Times 12pt · Double 2.0)
            </Button>

            {/* Harvard / UK Preset */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyStylePreset("harvard")}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1.5"
            >
              🇬🇧 Harvard (Calibri 11pt · 1.5)
            </Button>

            {/* IEEE / STEM Preset */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyStylePreset("ieee")}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1.5"
            >
              ⚙️ IEEE / STEM (Arial 10.5pt · Single)
            </Button>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-1" />

            {/* Line Spacing Dropdown */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase">Spacing:</span>
              {[
                { val: "1.0", label: "1.0 Single" },
                { val: "1.5", label: "1.5" },
                { val: "2.0", label: "2.0 Double (APA)" }
              ].map((sp) => (
                <Button
                  key={sp.val}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const editorEl = document.querySelector("[contenteditable='true']") as HTMLElement;
                    if (editorEl) editorEl.style.lineHeight = sp.val;
                    setCurrentLineSpacing(sp.val);
                    toast.success(`Line Spacing set to ${sp.val}`);
                  }}
                  className={`h-7 px-2 text-[10px] rounded-none ${currentLineSpacing === sp.val ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : ''}`}
                >
                  {sp.val}
                </Button>
              ))}
            </div>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-1" />

            {/* 1 Inch Margins Badge */}
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-2 py-1 bg-zinc-50 dark:bg-zinc-950">
              <span>📐 1-INCH APA MARGINS ENFORCED</span>
            </div>

          </div>
        )}

        {/* ── TAB 4: REFERENCES (Citations & Matrix Generator) ─────────── */}
        {activeTab === "references" && (
          <div className="flex items-center gap-2 min-w-max">
            
            {/* Citation Manager Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCitationsPanel}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Search &amp; Insert Citation (350M+ Papers)
            </Button>

            {/* Chapter 2 Literature Matrix Generator Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMatrixModal(true)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Chapter 2 Literature Matrix (7-Col)
            </Button>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-1" />

            {/* Insert References Section Template */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertHtmlAtCursor(`<div style="margin-top: 36px; border-top: 1px solid #000; padding-top: 24px;"><h2 style="font-family: 'Times New Roman', serif; text-align: center; font-weight: bold; margin-bottom: 16px;">References</h2><p style="padding-left: 0.5in; text-indent: -0.5in; line-height: 2.0; font-family: 'Times New Roman', serif;">Author, A. A., &amp; Author, B. B. (YEAR). Title of article. <em>Title of Periodical</em>, <em>volume number</em>(issue number), pages. https://doi.org/xx.xxx/yyyy</p></div><p><br></p>`)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 gap-1.5"
            >
              <List className="w-3.5 h-3.5" />
              Insert References Section (APA 7th)
            </Button>

            {/* Style Indicator Chips */}
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 ml-2">
              <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">APA 7th</span>
              <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">MLA 9th</span>
              <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">Harvard</span>
              <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">IEEE</span>
            </div>

          </div>
        )}

        {/* ── TAB 5: REVIEW & INTEGRITY (Tone & Rigor Auditor) ─────────── */}
        {activeTab === "review" && (
          <div className="flex items-center gap-2 min-w-max">
            
            {/* Academic Tone Auditor Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToneAuditorModal(true)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Pre-Submission Tone &amp; Turnitin Auditor
            </Button>

            {/* Document Statistics Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatsModal(true)}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Manuscript Word &amp; Reading Stats
            </Button>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 mx-1" />

            {/* AI Assistant Guidance Panel Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAnalysisPanel()}
              className="h-7 text-xs font-mono uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Thesis Advisor Panel
            </Button>

            {/* Quick Clean Spacing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const current = getCurrentSectionContent();
                const cleaned = current.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
                updateSectionContent(cleaned);
                toast.success("Normalized double spaces and extra line breaks!");
              }}
              className="h-7 text-[10px] font-mono uppercase tracking-wider rounded-none text-zinc-500 hover:text-black dark:hover:text-white"
            >
              Clean Spacing
            </Button>

          </div>
        )}

      </div>

      {/* ── Document Statistics Modal ────────────────────────────────────── */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-md p-5 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans">
          <DialogHeader className="mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <DialogTitle className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manuscript &amp; Section Metrics
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
            <div className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Word Count</span>
              <span className="text-lg font-bold text-black dark:text-white">{stats.words.toLocaleString()}</span>
            </div>
            <div className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Characters (With Spaces)</span>
              <span className="text-lg font-bold text-black dark:text-white">{stats.characters.toLocaleString()}</span>
            </div>
            <div className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Characters (No Spaces)</span>
              <span className="text-base font-bold text-black dark:text-white">{stats.charNoSpaces.toLocaleString()}</span>
            </div>
            <div className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Estimated Reading Time</span>
              <span className="text-base font-bold text-emerald-600">~{stats.minutes} min</span>
            </div>
          </div>

          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Estimated Sentences:</span>
              <span className="font-bold text-black dark:text-white">{stats.sentences}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Words per Sentence:</span>
              <span className="font-bold text-black dark:text-white">{stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0} wps</span>
            </div>
            <div className="flex justify-between">
              <span>Academic Target Level:</span>
              <span className="font-bold text-emerald-600 uppercase">Postgraduate / Ph.D.</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowStatsModal(false)}
              className="h-8 rounded-none bg-black text-white dark:bg-white dark:text-black font-mono text-xs uppercase tracking-wider"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Literature Matrix Modal (Chapter 2 Generator) ────────────────── */}
      <LiteratureMatrixModal
        isOpen={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        defaultTopic={getCurrentSectionTitle() || "Academic Research Topic"}
        onInsertToChapter={(content) => addContentToActiveSection(content)}
        onAddCitationsToLibrary={(citations) => {
          citations.forEach(c => insertCitation(c.title));
        }}
      />

      {/* ── Academic Tone Auditor Modal (Pre-Submission Rigor) ───────────── */}
      <AcademicToneAuditorModal
        isOpen={showToneAuditorModal}
        onClose={() => setShowToneAuditorModal(false)}
        currentText={getCurrentSectionContent()}
        onApplyEnhancedText={(newText) => updateSectionContent(newText)}
      />

    </div>
  );
}
