
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
    <Card className="p-3 bg-blue-50">
      <div className="flex items-start">
        <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium mb-1">Citation Format Preview</h4>
          <p className="text-xs text-gray-700">
            {citation 
              ? formatCitation(citation, style) 
              : `Example ${style} citation will appear here`}
          </p>
        </div>
      </div>
    </Card>
  );
}
