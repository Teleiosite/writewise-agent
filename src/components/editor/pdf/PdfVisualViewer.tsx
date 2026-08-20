import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Search, Quote, Copy, Check, FileText, Loader2, BookOpen 
} from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfVisualViewerProps {
  pdfData: ArrayBuffer | null;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onQuoteSelectedText?: (quote: string, pageNum: number) => void;
}

export function PdfVisualViewer({
  pdfData,
  numPages,
  currentPage,
  onPageChange,
  onQuoteSelectedText,
}: PdfVisualViewerProps) {
  const [scale, setScale] = useState<number>(1.2);
  const [isRendering, setIsRendering] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    if (!pdfData) return;

    let isCancelled = false;
    const loadDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        if (!isCancelled) {
          pdfDocRef.current = pdf;
          renderPage(currentPage, pdf, scale);
        }
      } catch (err: any) {
        console.error("PDF.js doc load error:", err);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfData]);

  // Render Page on Canvas
  const renderPage = async (pageNum: number, pdfDoc: any = pdfDocRef.current, currentScale: number = scale) => {
    if (!pdfDoc || !canvasRef.current) return;

    setIsRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      }
    } catch (err: any) {
      console.error("Page render error:", err);
    } finally {
      setIsRendering(false);
    }
  };

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage, pdfDocRef.current, scale);
    }
  }, [currentPage, scale]);

  // Handle Text Selection in Document Container
  const handleMouseUp = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      setSelectedText(selection);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setScale(1.2);

  const handleInsertQuote = () => {
    if (!selectedText || !onQuoteSelectedText) return;
    onQuoteSelectedText(selectedText, currentPage);
    toast.success(`Inserted quote from Page ${currentPage} into active chapter section`);
    setSelectedText("");
  };

  const handleCopyQuote = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(`"${selectedText}" (Page ${currentPage})`);
    setCopied(true);
    toast.success("Quote copied to clipboard with page citation");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 border border-black dark:border-zinc-800 font-sans">
      {/* Top Controls Toolbar */}
      <div className="p-2 border-b border-black dark:border-zinc-800 bg-white dark:bg-black flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isRendering}
            className="h-7 w-7 p-0 rounded-none border-black dark:border-zinc-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-zinc-500">Page</span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= numPages) onPageChange(val);
              }}
              className="w-10 h-7 text-center font-mono text-xs border border-black dark:border-zinc-700 bg-white dark:bg-black rounded-none"
            />
            <span className="text-zinc-500">of {numPages || 1}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages || isRendering}
            className="h-7 w-7 p-0 rounded-none border-black dark:border-zinc-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0 rounded-none text-zinc-600 dark:text-zinc-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0 rounded-none text-zinc-600 dark:text-zinc-400"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 px-1.5 text-[10px] rounded-none text-zinc-500 font-mono"
            title="Reset Zoom"
          >
            Fit
          </Button>
        </div>
      </div>

      {/* Selected Text Action Banner (Floating Toolbar) */}
      {selectedText && (
        <div className="bg-black text-white dark:bg-white dark:text-black p-2 px-3 flex items-center justify-between font-mono text-xs border-b border-black dark:border-white animate-in slide-in-from-top-2 duration-200">
          <div className="truncate max-w-[280px] text-[11px] opacity-90 italic">
            "{selectedText}"
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyQuote}
              className="h-6 px-2 text-[10px] uppercase font-mono rounded-none border-zinc-500 text-white dark:text-black bg-transparent hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              Copy Citation
            </Button>
            {onQuoteSelectedText && (
              <Button
                size="sm"
                onClick={handleInsertQuote}
                className="h-6 px-2 text-[10px] uppercase font-mono rounded-none bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800"
              >
                <Quote className="w-3 h-3 mr-1" />
                Insert Quote
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Canvas PDF Page Display Area */}
      <div 
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-auto p-4 flex justify-center items-start bg-zinc-200/70 dark:bg-zinc-950 relative"
      >
        {isRendering && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
          </div>
        )}

        <div className="shadow-2xl border border-zinc-300 dark:border-zinc-800 bg-white leading-none">
          <canvas ref={canvasRef} className="block max-w-full" />
        </div>
      </div>
    </div>
  );
}
