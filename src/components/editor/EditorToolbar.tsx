import React, { useState, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  Download, Save, Wifi, WifiOff,
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, FileCode, Printer, Undo2, Redo2, Table, Plus,
  Sparkles, ShieldCheck, BookOpen, Quote, Search,
  ChevronDown, Highlighter, Baseline, Sigma, Calendar, Layers,
  FileText, Indent, Outdent, RemoveFormatting, Info,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { LiteratureMatrixModal } from "@/components/matrix/LiteratureMatrixModal";
import { AcademicToneAuditorModal } from "@/components/editor/AcademicToneAuditorModal";

type RibbonTab = "home" | "insert" | "layout" | "references" | "review";

// ─── Toolbar Button (mousedown+preventDefault keeps editor focused) ────────────
interface ToolbarButtonProps {
  cmd: () => void;
  icon: React.ReactNode;
  title: string;
  className?: string;
  active?: boolean;
}

function Btn({ cmd, icon, title, className, active }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            // onMouseDown + preventDefault: the editor never loses focus so execCommand works
            onMouseDown={(e) => { e.preventDefault(); cmd(); }}
            className={`h-7 w-7 flex items-center justify-center rounded-none border transition-colors
              ${active
                ? "bg-zinc-200 dark:bg-zinc-800 border-black dark:border-zinc-500 text-black dark:text-white font-bold"
                : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              } ${className || ""}`}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] font-mono py-1 px-2 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white z-50">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-0.5 shrink-0" />;
}

export function EditorToolbar() {
  const {
    saveProject, exportDocument,
    lastSaved, wordCount, readingTime, isAutoSaving,
    toggleCitationsPanel, toggleAnalysisPanel,
    getCurrentSectionContent, updateSectionContent,
    getCurrentSectionTitle, addContentToActiveSection, insertCitation,
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
  const [currentFontSize, setCurrentFontSize] = useState("12");
  const [currentLineSpacing, setCurrentLineSpacing] = useState("2.0");

  const isOnline = useOnlineStatus();

  // ── Selection save/restore for dropdowns (focus leaves editor when dropdown opens)
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreAndFocus = useCallback(() => {
    const editorEl = document.querySelector<HTMLElement>("[contenteditable='true']");
    if (!editorEl) return;
    editorEl.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

  // ── Core execCommand (called after focus is already on editor) ─────────────
  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editorEl = document.querySelector<HTMLElement>("[contenteditable='true']");
    if (editorEl) editorEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  // ── execCommand after restoring focus (for dropdown items) ─────────────────
  const execFromDropdown = useCallback((command: string, value?: string) => {
    restoreAndFocus();
    // Small timeout lets the dropdown close and focus settle before execCommand
    setTimeout(() => {
      document.execCommand(command, false, value);
      const editorEl = document.querySelector<HTMLElement>("[contenteditable='true']");
      if (editorEl) editorEl.dispatchEvent(new Event("input", { bubbles: true }));
    }, 30);
  }, [restoreAndFocus]);

  // ── Font size: execCommand only takes 1-7; convert pt → span ───────────────
  const applyFontSize = useCallback((ptVal: string) => {
    restoreAndFocus();
    setTimeout(() => {
      const num = ptVal.replace(/[^0-9.]/g, "");
      // Use the sentinel size=7 trick, then swap to a styled span
      document.execCommand("fontSize", false, "7");
      const editor = document.querySelector<HTMLElement>("[contenteditable='true']");
      if (editor) {
        editor.querySelectorAll<HTMLElement>('font[size="7"]').forEach((font) => {
          const span = document.createElement("span");
          span.style.fontSize = `${num}pt`;
          while (font.firstChild) span.appendChild(font.firstChild);
          font.parentNode?.replaceChild(span, font);
        });
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 30);
    setCurrentFontSize(ptVal.split(" ")[0]);
  }, [restoreAndFocus]);

  // ── Font family ─────────────────────────────────────────────────────────────
  const applyFont = useCallback((name: string) => {
    execFromDropdown("fontName", name);
    setCurrentFont(name);
  }, [execFromDropdown]);

  // ── Insert raw HTML at cursor ────────────────────────────────────────────────
  const insertHtml = useCallback((html: string) => {
    restoreAndFocus();
    setTimeout(() => {
      document.execCommand("insertHTML", false, html);
      const editorEl = document.querySelector<HTMLElement>("[contenteditable='true']");
      if (editorEl) editorEl.dispatchEvent(new Event("input", { bubbles: true }));
    }, 30);
  }, [restoreAndFocus]);

  // ── Insert academic table ────────────────────────────────────────────────────
  const insertTable = useCallback((rows: number, cols: number) => {
    let html = `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-family:'Times New Roman',serif;font-size:11pt;border-top:2px solid #000;border-bottom:2px solid #000;">
      <thead><tr style="border-bottom:1px solid #000;background:#f8f9fa;">`;
    for (let c = 1; c <= cols; c++) {
      html += `<th style="padding:8px 12px;text-align:left;font-weight:bold;border-right:1px solid #e2e8f0;">Column ${c}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      html += `<tr style="border-bottom:1px solid #edf2f7;">`;
      for (let c = 1; c <= cols; c++) {
        html += `<td style="padding:8px 12px;border-right:1px solid #edf2f7;">Data ${r},${c}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    insertHtml(html);
    toast.success(`Inserted ${rows}×${cols} APA 7th Table`);
  }, [insertHtml]);

  // ── Callout box ──────────────────────────────────────────────────────────────
  const insertCallout = useCallback((type: "hypothesis" | "question" | "proposition" | "note") => {
    const templates: Record<string, string> = {
      hypothesis: `<div style="border-left:4px solid #000;background:#f8fafc;padding:12px 16px;margin:16px 0;font-family:'Times New Roman',serif;font-style:italic;"><strong>Hypothesis 1 (H₁):</strong> There is a statistically significant positive relationship between [Independent Variable] and [Dependent Variable].</div><p><br></p>`,
      question: `<div style="border-left:4px solid #2563eb;background:#eff6ff;padding:12px 16px;margin:16px 0;font-family:'Times New Roman',serif;"><strong>Research Question 1 (RQ₁):</strong> To what extent does [Variable A] influence [Variable B] within the context of [Context/Region]?</div><p><br></p>`,
      proposition: `<div style="border-left:4px solid #059669;background:#ecfdf5;padding:12px 16px;margin:16px 0;font-family:'Times New Roman',serif;font-style:italic;"><strong>Proposition 1:</strong> In institutional environments characterised by [Condition], organisations that adopt [Strategy] achieve higher performance outcomes.</div><p><br></p>`,
      note: `<div style="border:1px solid #000;background:#fafafa;padding:12px 16px;margin:16px 0;font-family:'Times New Roman',serif;"><strong>Methodological Note:</strong> [Insert clarification, scope delimitations, or ethical approval note here.]</div><p><br></p>`,
    };
    insertHtml(templates[type]);
    toast.success(`Inserted ${type.charAt(0).toUpperCase() + type.slice(1)} Box`);
  }, [insertHtml]);

  // ── 1-click academic style preset ────────────────────────────────────────────
  const applyPreset = useCallback((preset: "apa" | "harvard" | "ieee") => {
    const editorEl = document.querySelector<HTMLElement>("[contenteditable='true']");
    if (!editorEl) { toast.error("Click in the document first, then apply a preset."); return; }
    if (preset === "apa") {
      editorEl.style.fontFamily = "'Times New Roman', Times, serif";
      editorEl.style.fontSize = "12pt";
      editorEl.style.lineHeight = "2.0";
      editorEl.style.textAlign = "left";
      setCurrentFont("Times New Roman"); setCurrentFontSize("12"); setCurrentLineSpacing("2.0");
      toast.success("APA 7th applied — Times New Roman 12pt · Double spacing (2.0)");
    } else if (preset === "harvard") {
      editorEl.style.fontFamily = "Calibri, Arial, sans-serif";
      editorEl.style.fontSize = "11pt";
      editorEl.style.lineHeight = "1.5";
      editorEl.style.textAlign = "justify";
      setCurrentFont("Calibri"); setCurrentFontSize("11"); setCurrentLineSpacing("1.5");
      toast.success("Harvard / UK applied — Calibri 11pt · 1.5 spacing · Justified");
    } else {
      editorEl.style.fontFamily = "Arial, Helvetica, sans-serif";
      editorEl.style.fontSize = "10.5pt";
      editorEl.style.lineHeight = "1.15";
      editorEl.style.textAlign = "justify";
      setCurrentFont("Arial"); setCurrentFontSize("10.5"); setCurrentLineSpacing("1.15");
      toast.success("IEEE/STEM applied — Arial 10.5pt · Single spacing · Justified");
    }
  }, []);

  // ── Find and replace ─────────────────────────────────────────────────────────
  const handleFindReplace = useCallback(() => {
    if (!findQuery.trim()) { toast.error("Enter a search term."); return; }
    const current = getCurrentSectionContent();
    const raw = current.replace(/<[^>]+>/g, " ");
    if (!raw.toLowerCase().includes(findQuery.toLowerCase())) {
      toast.error(`"${findQuery}" not found in this section.`); return;
    }
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const count = (raw.match(regex) || []).length;
    const updated = current.replace(regex, replaceQuery);
    updateSectionContent(updated);
    toast.success(`Replaced ${count} occurrence(s) of "${findQuery}"`);
    setShowFindReplace(false);
  }, [findQuery, replaceQuery, getCurrentSectionContent, updateSectionContent]);

  // ── Manuscript stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const raw = getCurrentSectionContent();
    const clean = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const characters = clean.length;
    const charNoSpaces = clean.replace(/\s/g, "").length;
    const sentences = clean ? (clean.match(/[.!?]+/g) || []).length || 1 : 0;
    const minutes = Math.ceil(words / 220);
    return { words, characters, charNoSpaces, sentences, minutes };
  }, [getCurrentSectionContent]);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try { await exportDocument(format); }
    finally { setIsExporting(false); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col bg-white dark:bg-black border-b border-black dark:border-zinc-800 shrink-0 font-sans print:hidden select-none shadow-sm">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 gap-2 bg-zinc-50/60 dark:bg-zinc-950/60">

        {/* Left: Save, Undo/Redo, Export, Find */}
        <div className="flex items-center gap-1 flex-wrap">

          {/* Save */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); saveProject(); }}
            disabled={isAutoSaving}
            className="flex items-center gap-1 h-7 px-2 border border-black dark:border-zinc-700 font-mono text-[11px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white disabled:opacity-50"
          >
            <Save className="w-3 h-3 text-emerald-600" />
            {isAutoSaving ? "Saving…" : "Save"}
          </button>

          <Sep />

          {/* Undo / Redo */}
          <Btn cmd={() => exec("undo")} icon={<Undo2 className="w-3.5 h-3.5" />} title="Undo (Ctrl+Z)" />
          <Btn cmd={() => exec("redo")} icon={<Redo2 className="w-3.5 h-3.5" />} title="Redo (Ctrl+Y)" />

          <Sep />

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onMouseDown={saveSelection}
                className="flex items-center gap-1 h-7 px-2 border border-black dark:border-zinc-700 font-mono text-[11px] uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white disabled:opacity-50"
                disabled={isExporting}
              >
                <Download className="w-3 h-3" />
                Export
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 font-mono text-xs z-50 bg-white dark:bg-black">
              <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500">Download Format</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("docx")} className="cursor-pointer gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Microsoft Word (.DOCX)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("latex")} className="cursor-pointer gap-2 font-bold">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" /> Overleaf LaTeX (.ZIP)
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

          {/* Find & Replace */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowFindReplace(v => !v); }}
            className={`flex items-center gap-1 h-7 px-2 font-mono text-[11px] uppercase tracking-wider rounded-none ${showFindReplace ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold" : "text-zinc-500 hover:text-black dark:hover:text-white"}`}
          >
            <Search className="w-3 h-3" />
            Find
          </button>
        </div>

        {/* Right: status metrics */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider font-bold">
          <div className="flex items-center border border-black dark:border-zinc-800 px-2 py-0.5 bg-white dark:bg-black text-black dark:text-white">
            {isOnline ? <Wifi className="w-2.5 h-2.5 mr-1 text-emerald-600" /> : <WifiOff className="w-2.5 h-2.5 mr-1 text-zinc-400" />}
            <span className="hidden sm:inline">{isOnline ? "Cloud Sync" : "Offline"}</span>
          </div>
          {lastSaved && (
            <span className="hidden lg:inline text-zinc-400 text-[9px]">
              {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowStatsModal(true); }}
            className="border border-black dark:border-zinc-700 px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity flex items-center gap-1"
            title="Click for document statistics"
          >
            <span>{wordCount} WORDS</span>
            {readingTime > 0 && <span className="opacity-60 text-[9px]">({readingTime}m)</span>}
          </button>
        </div>
      </div>

      {/* ── FIND & REPLACE BAR ──────────────────────────────────────────── */}
      {showFindReplace && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 text-xs font-mono">
          <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Find…"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFindReplace()}
            className="h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono w-40 rounded-none outline-none"
          />
          <input
            type="text"
            placeholder="Replace with…"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFindReplace()}
            className="h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-xs font-mono w-40 rounded-none outline-none"
          />
          <Button size="sm" onClick={handleFindReplace} className="h-7 rounded-none bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] uppercase px-3">
            Replace All
          </Button>
          <button type="button" onClick={() => setShowFindReplace(false)} className="text-zinc-500 hover:text-black dark:hover:text-white text-xs font-mono px-1">
            ✕ Close
          </button>
        </div>
      )}

      {/* ── RIBBON TAB HEADERS ──────────────────────────────────────────── */}
      <div className="flex items-end border-b border-zinc-200 dark:border-zinc-800 px-2 bg-zinc-100/50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider overflow-x-auto no-scrollbar">
        {([
          { id: "home",       label: "Home",               icon: <Type className="w-3 h-3" /> },
          { id: "insert",     label: "Insert",             icon: <Plus className="w-3 h-3" /> },
          { id: "layout",     label: "Page Layout",        icon: <Layers className="w-3 h-3" /> },
          { id: "references", label: "References",         icon: <BookOpen className="w-3 h-3" /> },
          { id: "review",     label: "Review & Integrity", icon: <ShieldCheck className="w-3 h-3" /> },
        ] as { id: RibbonTab; label: string; icon: React.ReactNode }[]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === tab.id
                ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-black shadow-sm"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── RIBBON CONTENT ──────────────────────────────────────────────── */}
      <div className="flex items-center px-2 py-1 bg-white dark:bg-black overflow-x-auto no-scrollbar min-h-[44px]">

        {/* ── HOME TAB ──────────────────────────────────────────────────── */}
        {activeTab === "home" && (
          <div className="flex items-center gap-1 min-w-max">

            {/* Font family */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onMouseDown={saveSelection}
                  className="flex items-center justify-between gap-1.5 h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-serif text-xs rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[130px]"
                >
                  <span className="truncate">{currentFont}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs min-w-[200px]">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500">Academic Font</DropdownMenuLabel>
                {[
                  { name: "Times New Roman", style: "'Times New Roman', serif", tag: "APA 7th" },
                  { name: "Calibri",         style: "Calibri, sans-serif",       tag: "Modern" },
                  { name: "Arial",           style: "Arial, sans-serif",          tag: "IEEE/STEM" },
                  { name: "Georgia",         style: "Georgia, serif",             tag: "Editorial" },
                  { name: "Garamond",        style: "Garamond, serif",            tag: "Traditional" },
                  { name: "Courier New",     style: "Courier New, monospace",     tag: "Code / Raw" },
                ].map((f) => (
                  <DropdownMenuItem
                    key={f.name}
                    onClick={() => applyFont(f.name)}
                    className="cursor-pointer justify-between"
                    style={{ fontFamily: f.style }}
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400 font-sans">{f.tag}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font size */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onMouseDown={saveSelection}
                  className="flex items-center justify-between gap-1 h-7 px-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[56px]"
                >
                  <span>{currentFontSize}pt</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono min-w-[90px]">
                {["9", "10", "11", "12", "14", "16", "18", "24", "32"].map((s) => (
                  <DropdownMenuItem key={s} onClick={() => applyFontSize(s)} className="cursor-pointer">
                    {s}pt {s === "12" ? "(APA)" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sep />

            {/* Bold / Italic / Underline / Strike / Sub / Super */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <Btn cmd={() => exec("bold")}          icon={<Bold className="w-3.5 h-3.5" />}          title="Bold (Ctrl+B)" />
              <Btn cmd={() => exec("italic")}        icon={<Italic className="w-3.5 h-3.5" />}        title="Italic (Ctrl+I)" />
              <Btn cmd={() => exec("underline")}     icon={<Underline className="w-3.5 h-3.5" />}     title="Underline (Ctrl+U)" />
              <Btn cmd={() => exec("strikeThrough")} icon={<Strikethrough className="w-3.5 h-3.5" />} title="Strikethrough" />
              <Btn cmd={() => exec("subscript")}     icon={<Subscript className="w-3.5 h-3.5" />}     title="Subscript (X₂)" />
              <Btn cmd={() => exec("superscript")}   icon={<Superscript className="w-3.5 h-3.5" />}   title="Superscript (X²)" />
            </div>

            <Sep />

            {/* Text colour */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-0.5 h-7 px-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <Baseline className="w-3.5 h-3.5 text-black dark:text-white" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Text Colour</DropdownMenuLabel>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { color: "#000000", name: "Black" },
                    { color: "#1e3a8a", name: "Navy Blue" },
                    { color: "#991b1b", name: "Crimson" },
                    { color: "#065f46", name: "Dark Green" },
                    { color: "#475569", name: "Slate" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      title={c.name}
                      onClick={() => execFromDropdown("foreColor", c.color)}
                      style={{ backgroundColor: c.color }}
                      className="w-5 h-5 border border-zinc-300 hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Highlight */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-0.5 h-7 px-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Highlight</DropdownMenuLabel>
                <div className="flex gap-1">
                  {[
                    { color: "#fef08a", name: "Yellow" },
                    { color: "#bbf7d0", name: "Green" },
                    { color: "#bae6fd", name: "Blue" },
                    { color: "#fbcfe8", name: "Pink" },
                    { color: "transparent", name: "Clear" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      title={c.name}
                      onClick={() => execFromDropdown("hiliteColor", c.color === "transparent" ? "#ffffff" : c.color)}
                      style={{ backgroundColor: c.color === "transparent" ? "#ffffff" : c.color }}
                      className="w-5 h-5 border border-zinc-400 hover:scale-110 transition-transform text-[8px] flex items-center justify-center"
                    >
                      {c.color === "transparent" ? "✕" : ""}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear formatting */}
            <Btn cmd={() => exec("removeFormat")} icon={<RemoveFormatting className="w-3.5 h-3.5" />} title="Clear Formatting" />

            <Sep />

            {/* Alignment */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <Btn cmd={() => exec("justifyLeft")}   icon={<AlignLeft    className="w-3.5 h-3.5" />} title="Align Left" />
              <Btn cmd={() => exec("justifyCenter")} icon={<AlignCenter  className="w-3.5 h-3.5" />} title="Align Centre" />
              <Btn cmd={() => exec("justifyRight")}  icon={<AlignRight   className="w-3.5 h-3.5" />} title="Align Right" />
              <Btn cmd={() => exec("justifyFull")}   icon={<AlignJustify className="w-3.5 h-3.5" />} title="Justify (APA Full)" />
            </div>

            <Sep />

            {/* Lists & Indent */}
            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <Btn cmd={() => exec("insertUnorderedList")} icon={<List          className="w-3.5 h-3.5" />} title="Bullet List" />
              <Btn cmd={() => exec("insertOrderedList")}   icon={<ListOrdered   className="w-3.5 h-3.5" />} title="Numbered List" />
              <Btn cmd={() => exec("outdent")}              icon={<Outdent       className="w-3.5 h-3.5" />} title="Decrease Indent" />
              <Btn cmd={() => exec("indent")}               icon={<Indent        className="w-3.5 h-3.5" />} title="Increase Indent" />
            </div>

            <Sep />

            {/* Heading / Paragraph style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-white dark:bg-black font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <span>Style</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono min-w-[170px]">
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<p>")}          className="cursor-pointer">Normal Paragraph</DropdownMenuItem>
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<h1>")}         className="cursor-pointer font-bold text-base">Heading 1 — Chapter Title</DropdownMenuItem>
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<h2>")}         className="cursor-pointer font-bold text-sm">Heading 2 — Section</DropdownMenuItem>
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<h3>")}         className="cursor-pointer font-semibold">Heading 3 — Subsection</DropdownMenuItem>
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<blockquote>")} className="cursor-pointer italic text-zinc-600">Blockquote / Excerpt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => execFromDropdown("formatBlock", "<pre>")}        className="cursor-pointer font-mono text-[11px]">Code / Raw Data Block</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        )}

        {/* ── INSERT TAB ────────────────────────────────────────────────── */}
        {activeTab === "insert" && (
          <div className="flex items-center gap-1.5 min-w-max">

            {/* Table */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <Table className="w-3.5 h-3.5" /> Table <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono p-2 min-w-[180px]">
                <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 mb-1">Insert APA 7th Table</DropdownMenuLabel>
                {[["2×2 Grid","2","2"],["3×3 Standard","3","3"],["4×4 Matrix","4","4"],["6×5 Data Table","6","5"]].map(([label, rows, cols]) => (
                  <DropdownMenuItem key={label} onClick={() => insertTable(Number(rows), Number(cols))} className="cursor-pointer">{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Callout boxes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <Quote className="w-3.5 h-3.5" /> Callout Box <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black text-xs font-mono">
                <DropdownMenuItem onClick={() => insertCallout("hypothesis")}  className="cursor-pointer">Hypothesis Box (H₁)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCallout("question")}    className="cursor-pointer">Research Question (RQ₁)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCallout("proposition")} className="cursor-pointer">Theoretical Proposition</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCallout("note")}        className="cursor-pointer">Methodological Note</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sep />

            {/* Statistical / Greek symbols */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" onMouseDown={saveSelection} className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <Sigma className="w-3.5 h-3.5" /> Symbols (α β χ²) <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border border-black dark:border-zinc-800 z-50 bg-white dark:bg-black p-2.5 max-w-[240px]">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">Statistical &amp; Greek Symbols</DropdownMenuLabel>
                <div className="grid grid-cols-6 gap-0.5 font-serif text-sm text-center">
                  {["α","β","γ","δ","ε","θ","λ","μ","π","σ","τ","χ²","Δ","Σ","Ω","±","≤","≥","≠","≈","∞","→","R²","η²"].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => { restoreAndFocus(); setTimeout(() => exec("insertText", ` ${sym} `), 30); }}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-1.5" />
                <div className="grid grid-cols-3 gap-0.5 font-mono text-[10px]">
                  {["p < .05","p < .01","p < .001","N = ","t =","F ="].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => { restoreAndFocus(); setTimeout(() => exec("insertText", ` ${sym} `), 30); }}
                      className="px-1 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* LaTeX equation */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertHtml(`<div style="background:#f1f5f9;padding:10px 16px;border:1px dashed #94a3b8;font-family:monospace;font-size:11pt;margin:12px 0;text-align:center;">$$ Y_i = \\beta_0 + \\beta_1 X_{1i} + \\beta_2 X_{2i} + \\epsilon_i $$</div><p><br></p>`); toast.success("LaTeX equation block inserted"); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <FileCode className="w-3.5 h-3.5" /> LaTeX Equation
            </button>

            <Sep />

            {/* Page break */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertHtml(`<div style="page-break-after:always;border-top:2px dashed #94a3b8;margin:24px 0;text-align:center;font-size:9pt;color:#64748b;font-family:monospace;">— Page Break —</div><p><br></p>`); toast.success("Page break inserted"); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Page Break
            </button>

            {/* Horizontal rule */}
            <Btn cmd={() => exec("insertHorizontalRule")} icon={<span className="text-[10px] font-mono">―</span>} title="Horizontal Rule" />

            {/* Date stamp */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); exec("insertHTML", `<strong>${new Date().toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" })}</strong>`); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Calendar className="w-3.5 h-3.5" /> Date Stamp
            </button>

          </div>
        )}

        {/* ── PAGE LAYOUT TAB ───────────────────────────────────────────── */}
        {activeTab === "layout" && (
          <div className="flex items-center gap-2 min-w-max">

            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold ml-1 shrink-0">1-Click Standards:</span>

            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyPreset("apa"); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold">
              🎓 APA 7th
            </button>

            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyPreset("harvard"); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
              🇬🇧 Harvard / UK
            </button>

            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyPreset("ieee"); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
              ⚙️ IEEE / STEM
            </button>

            <Sep />

            {/* Line spacing */}
            <span className="font-mono text-[10px] text-zinc-500 uppercase shrink-0">Line Spacing:</span>
            {[["1.0","1.0"],["1.5","1.5"],["2.0","2.0 (APA)"]].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const el = document.querySelector<HTMLElement>("[contenteditable='true']");
                  if (el) el.style.lineHeight = val;
                  setCurrentLineSpacing(val);
                  toast.success(`Line spacing set to ${val}`);
                }}
                className={`h-7 px-2 font-mono text-[11px] border ${currentLineSpacing === val ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold" : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
              >
                {label}
              </button>
            ))}

            <Sep />
            <div className="font-mono text-[10px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 shrink-0">
              📐 1-Inch APA Margins Enforced
            </div>

          </div>
        )}

        {/* ── REFERENCES TAB ────────────────────────────────────────────── */}
        {activeTab === "references" && (
          <div className="flex items-center gap-2 min-w-max">

            {/* Citation Manager */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); toggleCitationsPanel(); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" /> Search &amp; Insert Citation (350M+)
            </button>

            {/* Literature Matrix Generator */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowMatrixModal(true); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chapter 2 Literature Matrix
            </button>

            <Sep />

            {/* Insert references section template */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertHtml(`<div style="margin-top:36px;border-top:1px solid #000;padding-top:24px;"><h2 style="font-family:'Times New Roman',serif;text-align:center;font-weight:bold;margin-bottom:16px;">References</h2><p style="padding-left:0.5in;text-indent:-0.5in;line-height:2.0;font-family:'Times New Roman',serif;">Author, A. A., &amp; Author, B. B. (YEAR). Title of article. <em>Title of Periodical</em>, <em>volume number</em>(issue number), pages. https://doi.org/xx.xxx/yyyy</p></div><p><br></p>`);
                toast.success("APA 7th References section inserted");
              }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <List className="w-3.5 h-3.5" /> Insert References Section
            </button>

            {/* Style chips */}
            <div className="flex gap-1 font-mono text-[10px] text-zinc-500">
              {["APA 7th","MLA 9th","Harvard","IEEE"].map(s => (
                <span key={s} className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">{s}</span>
              ))}
            </div>

          </div>
        )}

        {/* ── REVIEW & INTEGRITY TAB ────────────────────────────────────── */}
        {activeTab === "review" && (
          <div className="flex items-center gap-2 min-w-max">

            {/* Tone & Turnitin Auditor */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowToneAuditorModal(true); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pre-Submission Tone Auditor
            </button>

            {/* Word & reading stats */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowStatsModal(true); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <FileText className="w-3.5 h-3.5" /> Word &amp; Reading Stats
            </button>

            <Sep />

            {/* AI Thesis Advisor Panel */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); toggleAnalysisPanel(); }}
              className="flex items-center gap-1.5 h-7 px-2 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Thesis Advisor
            </button>

            {/* Clean spacing */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const cur = getCurrentSectionContent();
                const cleaned = cur.replace(/[ \t]{2,}/g, " ").replace(/(\n\s*){3,}/g, "\n\n");
                updateSectionContent(cleaned);
                toast.success("Normalised double-spaces and excess line breaks");
              }}
              className="flex items-center gap-1.5 h-7 px-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white"
            >
              Clean Spacing
            </button>

          </div>
        )}

      </div>

      {/* ── DOCUMENT STATISTICS MODAL ───────────────────────────────────── */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-md p-5 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans">
          <DialogHeader className="mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <DialogTitle className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4" /> Manuscript &amp; Section Metrics
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
            {[
              ["Word Count",              String(stats.words.toLocaleString()),             ""],
              ["Characters (w/ Spaces)",  String(stats.characters.toLocaleString()),        ""],
              ["Characters (no Spaces)",  String(stats.charNoSpaces.toLocaleString()),      ""],
              ["Estimated Reading Time",  `~${stats.minutes} min`,                         "text-emerald-600"],
            ].map(([label, value, cls]) => (
              <div key={label} className="p-3 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">{label}</span>
                <span className={`text-lg font-bold text-black dark:text-white ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 mb-4">
            <div className="flex justify-between">
              <span>Estimated Sentences:</span>
              <span className="font-bold text-black dark:text-white">{stats.sentences}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Words / Sentence:</span>
              <span className="font-bold text-black dark:text-white">{stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0} wps</span>
            </div>
            <div className="flex justify-between">
              <span>Target Academic Level:</span>
              <span className="font-bold text-emerald-600 uppercase">Postgraduate / PhD</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowStatsModal(false)} className="h-8 rounded-none bg-black text-white dark:bg-white dark:text-black font-mono text-xs uppercase tracking-wider">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LITERATURE MATRIX MODAL ─────────────────────────────────────── */}
      <LiteratureMatrixModal
        isOpen={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        defaultTopic={getCurrentSectionTitle() || "Academic Research Topic"}
        onInsertToChapter={(content) => addContentToActiveSection(content)}
        onAddCitationsToLibrary={(citations) => { citations.forEach(c => insertCitation(c.title)); }}
      />

      {/* ── ACADEMIC TONE AUDITOR MODAL ──────────────────────────────────── */}
      <AcademicToneAuditorModal
        isOpen={showToneAuditorModal}
        onClose={() => setShowToneAuditorModal(false)}
        currentText={getCurrentSectionContent()}
        onApplyEnhancedText={(newText) => updateSectionContent(newText)}
      />

    </div>
  );
}
