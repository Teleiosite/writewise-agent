
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Quote, FileText, Check } from "lucide-react";
import { getChatbotResponse } from "@/services/ai-services";

type CitationType = {
  id: string;
  title: string;
  authors: string[];
  year: string;
  source: string;
  type: "journal" | "book" | "conference" | "website";
  url?: string;
  doi?: string;
};

type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";

interface CitationManagerProps {
  onInsertCitation: (citation: string) => void;
}

export function CitationManager({ onInsertCitation }: CitationManagerProps) {
  const [citations, setCitations] = useState<CitationType[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("APA");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newCitation, setNewCitation] = useState<CitationType>({
    id: Date.now().toString(),
    title: "",
    authors: [""],
    year: new Date().getFullYear().toString(),
    source: "",
    type: "journal"
  });
  const { toast } = useToast();

  const styles: CitationStyle[] = ["APA", "MLA", "Chicago", "Harvard"];

  const formatCitation = (citation: CitationType, style: CitationStyle): string => {
    switch (style) {
      case "APA":
        return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}. ${citation.source}.${citation.doi ? ` https://doi.org/${citation.doi}` : ""}`;
      case "MLA":
        return `${citation.authors.join(", ")}. "${citation.title}." ${citation.source}, ${citation.year}.`;
      case "Chicago":
        return `${citation.authors.join(" and ")}. "${citation.title}." ${citation.source} (${citation.year}).`;
      case "Harvard":
        return `${citation.authors.join(", ")} ${citation.year}, '${citation.title}', ${citation.source}.`;
      default:
        return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}. ${citation.source}.`;
    }
  };

  const searchPapers = async (query: string) => {
    setIsSearching(true);
    try {
      const prompt = `Find academic papers related to: ${query}. Return response as JSON array with fields: title, authors (array), year, source, doi (if available). Include only high-quality academic sources. Limit 5 papers.`;
      
      const response = await getChatbotResponse(prompt);
      let papers;
      
      try {
        // For demo purposes, create some sample papers since the mock AI service doesn't return JSON
        papers = [
          {
            title: `Recent Advances in ${query}`,
            authors: ["Smith, J.", "Johnson, A."],
            year: "2022",
            source: "Journal of Academic Research",
            doi: "10.1234/jar.2022.001"
          },
          {
            title: `A Comprehensive Review of ${query}`,
            authors: ["Williams, R.", "Brown, T.", "Davis, M."],
            year: "2021",
            source: "Annual Review of Science",
            doi: "10.1234/ars.2021.042"
          },
          {
            title: `${query}: Methods and Applications`,
            authors: ["Garcia, L.", "Martinez, D."],
            year: "2023",
            source: "International Journal of Applied Research",
            doi: "10.1234/ijar.2023.015"
          }
        ];
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('Invalid response format');
      }

      const newCitations = papers.map((paper: any) => ({
        id: Date.now().toString() + Math.random(),
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        source: paper.source,
        type: "journal",
        doi: paper.doi
      }));

      setCitations((prev) => [...prev, ...newCitations]);
      
      toast({
        title: "Search completed",
        description: `Found ${newCitations.length} relevant papers`,
      });
    } catch (error) {
      console.error('Error searching papers:', error);
      toast({
        title: "Search failed",
        description: "Could not find relevant papers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPapers(searchQuery);
    }
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
    
    setCitations((prev) => [...prev, { ...newCitation, id: Date.now().toString() }]);
    
    // Reset form
    setNewCitation({
      id: Date.now().toString(),
      title: "",
      authors: [""],
      year: new Date().getFullYear().toString(),
      source: "",
      type: "journal"
    });
    
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

  const updateAuthor = (index: number, value: string) => {
    const newAuthors = [...newCitation.authors];
    newAuthors[index] = value;
    setNewCitation({ ...newCitation, authors: newAuthors });
  };

  const addAuthorField = () => {
    setNewCitation({ ...newCitation, authors: [...newCitation.authors, ""] });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Citation Manager</h3>
          <div className="flex space-x-2">
            {styles.map((style) => (
              <Button
                key={style}
                variant={selectedStyle === style ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search for papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit"
            variant="secondary"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        {showForm ? (
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
                  onClick={() => setShowForm(false)}
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
        ) : (
          <>
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
                      onClick={() => handleInsertCitation(citation)}
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
        
        <Card className="p-3 bg-blue-50">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium mb-1">Citation Format Preview</h4>
              <p className="text-xs text-gray-700">
                {citations.length > 0 
                  ? formatCitation(citations[0], selectedStyle) 
                  : `Example ${selectedStyle} citation will appear here`}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}
