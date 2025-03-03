
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
    <ScrollArea className="h-[300px] border rounded-md p-2">
      <div className="space-y-2">
        {citations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No citations yet. Search for papers or add citations manually.</p>
          </div>
        ) : (
          citations.map((citation) => (
            <Card
              key={citation.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectCitation(citation)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{citation.title}</h4>
                  <p className="text-sm text-gray-600">
                    {citation.authors.join(", ")} • {citation.year}
                  </p>
                  <p className="text-sm text-gray-500">{citation.source}</p>
                  {citation.doi && (
                    <p className="text-xs text-blue-600">DOI: {citation.doi}</p>
                  )}
                </div>
                <Quote className="w-4 h-4 text-gray-400" />
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
