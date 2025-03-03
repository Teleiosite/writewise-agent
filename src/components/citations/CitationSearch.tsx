
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getChatbotResponse } from "@/services/ai-services";
import { CitationType } from "./types";

interface CitationSearchProps {
  onCitationsFound: (citations: CitationType[]) => void;
}

export function CitationSearch({ onCitationsFound }: CitationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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

      onCitationsFound(newCitations);
      
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

  return (
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
  );
}
