import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Quote,
  FileText,
  Plus,
  Search,
  BookmarkIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { getChatbotResponse } from "@/lib/chatbot";

export type CitationType = {
  id: string;
  title: string;
  authors: string[];
  year: string;
  source: string;
  type: "journal" | "book" | "conference" | "website";
  url?: string;
};

export type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";

interface CitationManagerProps {
  onInsertCitation: (citation: string) => void;
}

const formatCitation = (citation: CitationType, style: CitationStyle): string => {
  switch (style) {
    case "APA":
      return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}. ${citation.source}.`;
    case "MLA":
      return `${citation.authors[0].split(",")[0]} et al. "${citation.title}." ${citation.source}, ${citation.year}.`;
    case "Chicago":
      return `${citation.authors.join(" and ")}. "${citation.title}." ${citation.source} (${citation.year}).`;
    case "Harvard":
      return `${citation.authors.join(" and ")} ${citation.year}, '${citation.title}', ${citation.source}.`;
    default:
      return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}.`;
  }
};

export function CitationManager({ onInsertCitation }: CitationManagerProps) {
  const [citations, setCitations] = useState<CitationType[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("APA");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const styles: CitationStyle[] = ["APA", "MLA", "Chicago", "Harvard"];

  const searchPapers = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await getChatbotResponse(
        `Find academic papers related to: ${query}. Format the response as JSON array with fields: title, authors (array), year, source. Only include high-quality academic sources.`
      );

      const papers = JSON.parse(response.content);
      
      const newCitations = papers.map((paper: any) => ({
        id: Date.now().toString() + Math.random(),
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        source: paper.source,
        type: "journal"
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

  const handleAddCitation = (citation: CitationType) => {
    setCitations([...citations, citation]);
  };

  const handleInsertCitation = (citation: CitationType) => {
    const formattedCitation = formatCitation(citation, selectedStyle);
    onInsertCitation(formattedCitation);
  };

  const filteredCitations = citations.filter(
    (citation) =>
      citation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citation.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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

        <ScrollArea className="h-[300px] border rounded-md p-2">
          <div className="space-y-2">
            {filteredCitations.map((citation) => (
              <Card
                key={citation.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleInsertCitation(citation)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{citation.title}</h4>
                    <p className="text-sm text-gray-600">
                      {citation.authors.join(", ")} • {citation.year}
                    </p>
                    <p className="text-sm text-gray-500">{citation.source}</p>
                  </div>
                  <Quote className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <Button
          className="w-full"
          variant="outline"
          onClick={() =>
            handleAddCitation({
              id: Date.now().toString(),
              title: "Sample Citation",
              authors: ["Author, A.", "Author, B."],
              year: "2024",
              source: "Journal of Examples",
              type: "journal",
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Citation
        </Button>
      </div>
    </Card>
  );
}
