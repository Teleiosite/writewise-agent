
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CitationType, CitationStyle, CitationManagerProps } from "./types";
import { CitationSearch } from "./CitationSearch";
import { CitationList } from "./CitationList";
import { CitationForm } from "./CitationForm";
import { CitationPreview } from "./CitationPreview";
import { CitationStyleSelector } from "./CitationStyleSelector";
import { formatCitation } from "./citationUtils";

export function CitationManager({ onInsertCitation }: CitationManagerProps) {
  const [citations, setCitations] = useState<CitationType[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("APA");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleCitationsFound = (newCitations: CitationType[]) => {
    setCitations((prev) => [...prev, ...newCitations]);
  };

  const handleSaveCitation = (citation: CitationType) => {
    setCitations((prev) => [...prev, citation]);
    setShowForm(false);
    
    toast({
      title: "Citation added",
      description: "The citation has been added to your list.",
    });
  };

  const handleInsertCitation = (citation: CitationType) => {
    const formattedCitation = formatCitation(citation, selectedStyle);
    onInsertCitation(formattedCitation);
    toast({
      title: "Citation inserted",
      description: `Citation inserted in ${selectedStyle} format.`,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Citation Manager</h3>
          <CitationStyleSelector 
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
        </div>

        <CitationSearch onCitationsFound={handleCitationsFound} />

        {showForm ? (
          <CitationForm 
            onSave={handleSaveCitation} 
            onCancel={() => setShowForm(false)} 
          />
        ) : (
          <>
            <CitationList 
              citations={citations} 
              onSelectCitation={handleInsertCitation} 
            />

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Citation
            </Button>
          </>
        )}
        
        <CitationPreview 
          citation={citations[0]} 
          style={selectedStyle} 
        />
      </div>
    </Card>
  );
}
