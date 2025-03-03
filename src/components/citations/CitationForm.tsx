
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CitationType } from "./types";

interface CitationFormProps {
  onSave: (citation: CitationType) => void;
  onCancel: () => void;
}

export function CitationForm({ onSave, onCancel }: CitationFormProps) {
  const [newCitation, setNewCitation] = useState<CitationType>({
    id: Date.now().toString(),
    title: "",
    authors: [""],
    year: new Date().getFullYear().toString(),
    source: "",
    type: "journal"
  });
  const { toast } = useToast();

  const updateAuthor = (index: number, value: string) => {
    const newAuthors = [...newCitation.authors];
    newAuthors[index] = value;
    setNewCitation({ ...newCitation, authors: newAuthors });
  };

  const addAuthorField = () => {
    setNewCitation({ ...newCitation, authors: [...newCitation.authors, ""] });
  };

  const handleAddCitation = () => {
    if (!newCitation.title || !newCitation.source || newCitation.authors.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title, author, and source.",
        variant: "destructive"
      });
      return;
    }
    
    onSave({ ...newCitation, id: Date.now().toString() });
  };

  return (
    <Card className="p-4 bg-gray-50">
      <h4 className="font-medium mb-3">Add New Citation</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Title</label>
          <Input 
            value={newCitation.title}
            onChange={(e) => setNewCitation({ ...newCitation, title: e.target.value })}
            placeholder="Paper or book title"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Authors</label>
          {newCitation.authors.map((author, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input 
                value={author}
                onChange={(e) => updateAuthor(index, e.target.value)}
                placeholder="Author name (e.g., Smith, J.)"
              />
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addAuthorField}
            className="mt-1"
          >
            Add Another Author
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Year</label>
            <Input 
              value={newCitation.year}
              onChange={(e) => setNewCitation({ ...newCitation, year: e.target.value })}
              placeholder="Publication year"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Type</label>
            <select 
              value={newCitation.type}
              onChange={(e) => setNewCitation({ 
                ...newCitation, 
                type: e.target.value as "journal" | "book" | "conference" | "website" 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="journal">Journal</option>
              <option value="book">Book</option>
              <option value="conference">Conference</option>
              <option value="website">Website</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Source</label>
          <Input 
            value={newCitation.source}
            onChange={(e) => setNewCitation({ ...newCitation, source: e.target.value })}
            placeholder="Journal name, book publisher, etc."
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-600 mb-1 block">DOI (optional)</label>
          <Input 
            value={newCitation.doi || ""}
            onChange={(e) => setNewCitation({ ...newCitation, doi: e.target.value })}
            placeholder="Digital Object Identifier"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleAddCitation}
          >
            <Check className="w-4 h-4 mr-2" />
            Save Citation
          </Button>
        </div>
      </div>
    </Card>
  );
}
