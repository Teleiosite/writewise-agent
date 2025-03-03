
import { Button } from "@/components/ui/button";
import { CitationStyle } from "./types";
import { citationStyles } from "./citationUtils";

interface CitationStyleSelectorProps {
  selectedStyle: CitationStyle;
  onStyleChange: (style: CitationStyle) => void;
}

export function CitationStyleSelector({ 
  selectedStyle, 
  onStyleChange 
}: CitationStyleSelectorProps) {
  return (
    <div className="flex space-x-2">
      {citationStyles.map((style) => (
        <Button
          key={style}
          variant={selectedStyle === style ? "default" : "outline"}
          size="sm"
          onClick={() => onStyleChange(style)}
        >
          {style}
        </Button>
      ))}
    </div>
  );
}
