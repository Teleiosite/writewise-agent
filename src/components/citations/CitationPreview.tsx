import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { CitationType, CitationStyle } from "./types";
import { formatCitation } from "./citationUtils";

interface CitationPreviewProps {
  citation?: CitationType;
  style: CitationStyle;
}

export function CitationPreview({ citation, style }: CitationPreviewProps) {
  return (
    <Card className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-black dark:border-zinc-800 rounded-none shadow-none font-sans">
      <div className="flex items-start">
        <FileText className="w-4 h-4 text-black dark:text-white mr-2.5 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-1 text-black dark:text-white">Citation Format Preview</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            {citation 
              ? formatCitation(citation, style) 
              : `Example ${style} citation will appear here`}
          </p>
        </div>
      </div>
    </Card>
  );
}
