import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Quote } from "lucide-react";
import { CitationType } from "./types";

interface CitationListProps {
  citations: CitationType[];
  onSelectCitation: (citation: CitationType) => void;
}

export function CitationList({ citations, onSelectCitation }: CitationListProps) {
  return (
    <ScrollArea className="h-[300px] border border-black dark:border-zinc-800 rounded-none p-2 font-sans bg-white dark:bg-black">
      <div className="space-y-2 font-mono text-xs">
        {citations.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 uppercase tracking-wider">
            <p>No citations registered yet.</p>
          </div>
        ) : (
          citations.map((citation) => (
            <Card
              key={citation.id}
              className="p-3 border border-black dark:border-zinc-800 rounded-none hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors shadow-none"
              onClick={() => onSelectCitation(citation)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-black dark:text-white uppercase tracking-wider">{citation.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {citation.authors.join(", ")} • {citation.year}
                  </p>
                  <p className="text-xs text-zinc-500">{citation.source}</p>
                  {citation.doi && (
                    <p className="text-[11px] text-black dark:text-white underline mt-1">DOI: {citation.doi}</p>
                  )}
                </div>
                <Quote className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
