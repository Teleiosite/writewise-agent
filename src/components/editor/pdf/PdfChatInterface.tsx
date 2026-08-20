import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Sparkles, FileText, FlaskConical, TrendingUp, AlertTriangle, 
  BookOpen, Plus, Copy, Check, ArrowRight, Trash2, Quote, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { ChatMessage, PdfDocumentMeta } from "./types";
import { usePdfChat } from "./hooks/usePdfChat";
import { AcademicCitation } from "@/services/citationEngine";

interface PdfChatInterfaceProps {
  docMeta: PdfDocumentMeta | null;
  onAddContent: (content: string) => void;
  onPageJump?: (pageNum: number) => void;
  onAddCitationToLibrary?: (citation: AcademicCitation) => void;
}

export function PdfChatInterface({
  docMeta,
  onAddContent,
  onPageJump,
  onAddCitationToLibrary
}: PdfChatInterfaceProps) {
  const {
    chatMessages,
    inputMessage,
    setInputMessage,
    generatedQuestions,
    isLoading,
    handleSendMessage,
    handleExtractMethodology,
    handleExtractFindings,
    handleExtractLimitations,
    handleExtractChapter2Summary,
    handleExtractCitationMetadata,
    handleClearHistory,
    scrollAreaRef
  } = usePdfChat(docMeta);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExtractingCitation, setIsExtractingCitation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Answer copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertToChapter = (content: string) => {
    onAddContent(`\n\n${content}\n`);
    toast.success("Inserted content into active chapter section");
  };

  const handleExtractAndAddCitation = async () => {
    setIsExtractingCitation(true);
    try {
      const citation = await handleExtractCitationMetadata();
      if (citation && onAddCitationToLibrary) {
        onAddCitationToLibrary(citation);
        toast.success(`Extracted & added "${citation.title.substring(0, 35)}..." to your Citation Library!`);
      } else {
        toast.error("Could not parse bibliographic header.");
      }
    } catch {
      toast.error("Citation extraction failed.");
    } finally {
      setIsExtractingCitation(false);
    }
  };

  if (!docMeta) {
    return (
      <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-sans space-y-2 h-full flex flex-col items-center justify-center">
        <BookOpen className="w-8 h-8 text-zinc-400" />
        <h4 className="font-mono text-xs font-bold uppercase text-black dark:text-white">
          No PDF Loaded
        </h4>
        <p className="text-[11px] text-zinc-500 font-mono max-w-xs">
          Open a research paper to start deep page-cited AI questions and automated literature synthesis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border border-black dark:border-zinc-800 font-sans">
      {/* 1-Click Academic Extraction Toolbar */}
      <div className="p-2.5 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-black dark:text-white" />
            1-Click Research Extractors
          </span>
          <button
            onClick={handleClearHistory}
            className="hover:text-red-600 flex items-center gap-0.5 text-zinc-400"
            title="Clear Chat History"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExtractMethodology}
            disabled={isLoading}
            className="h-7 px-2 text-[10px] uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1"
          >
            <FlaskConical className="w-3 h-3" /> Methodology
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExtractFindings}
            disabled={isLoading}
            className="h-7 px-2 text-[10px] uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1"
          >
            <TrendingUp className="w-3 h-3" /> Key Stats
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExtractLimitations}
            disabled={isLoading}
            className="h-7 px-2 text-[10px] uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1"
          >
            <AlertTriangle className="w-3 h-3" /> Limitations
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExtractChapter2Summary}
            disabled={isLoading}
            className="h-7 px-2 text-[10px] uppercase tracking-wider rounded-none border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1"
          >
            <BookOpen className="w-3 h-3" /> Ch. 2 Summary
          </Button>
        </div>

        {onAddCitationToLibrary && (
          <div className="pt-1 flex justify-end">
            <button
              onClick={handleExtractAndAddCitation}
              disabled={isExtractingCitation}
              className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 underline"
            >
              <Plus className="w-3 h-3" />
              {isExtractingCitation ? "Extracting..." : "Auto-Add Paper to Citation Library"}
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages Log */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs"
      >
        {chatMessages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`p-3.5 max-w-[88%] space-y-2 ${
                msg.role === 'user'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-mono text-xs'
                  : 'bg-zinc-50 dark:bg-zinc-950 border border-black dark:border-zinc-800 text-black dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Page Anchor Badges */}
              {msg.role === 'assistant' && msg.citedPages && msg.citedPages.length > 0 && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-zinc-500 uppercase text-[9px]">Cited Pages:</span>
                  {msg.citedPages.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => onPageJump && onPageJump(pageNum)}
                      className="px-1.5 py-0.5 border border-black dark:border-zinc-700 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white flex items-center gap-0.5 transition-colors"
                      title={`Jump to page ${pageNum} in PDF visual viewer`}
                    >
                      <span>Page {pageNum}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              )}

              {/* Actions on Assistant Response */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[10px]">
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertToChapter(msg.content)}
                    className="h-6 px-2 text-[10px] uppercase font-mono rounded-none border-black dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black gap-1"
                  >
                    <Plus className="w-3 h-3" /> Insert to Editor
                  </Button>
                </div>
              )}
            </div>

            <span className="text-[9px] font-mono text-zinc-400 mt-1 px-1">
              {msg.role === 'user' ? 'You' : 'Academic Peer AI'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-xs text-zinc-500 animate-pulse">
              Analyzing indexed pages &amp; formulating citation evidence...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      {generatedQuestions.length > 0 && (
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 overflow-x-auto no-scrollbar flex items-center gap-1.5 font-mono text-[10px]">
          <span className="text-zinc-400 uppercase text-[9px] shrink-0">Ask:</span>
          {generatedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white truncate max-w-[220px] shrink-0"
              title={q}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Chat Prompt Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-black dark:border-zinc-800 bg-white dark:bg-black flex gap-2"
      >
        <Input
          placeholder={`Ask about "${docMeta.name}" (e.g. sample size, findings, theory)...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          className="h-10 rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
        />
        <Button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider px-5 border border-black dark:border-white shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
