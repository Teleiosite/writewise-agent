
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
      const { callChatGptApi } = await import("@/services/api-client");

      const data = await callChatGptApi(
        `You are an academic research assistant. Find 3 real, existing academic papers highly relevant to the query. Return ONLY a valid JSON array with no extra text. Each item must have exactly these fields: "title" (string), "authors" (array of strings), "year" (string), "source" (journal or publisher name string), "doi" (string or null). Do not fabricate titles or authors.`,
        `Find academic papers related to: ${query}`
      );

      const raw = data.choices?.[0]?.message?.content?.trim() ?? "[]";
      const clean = raw.replace(/```json|```/g, "").trim();

      let papers: any[];
      try {
        papers = JSON.parse(clean);
        if (!Array.isArray(papers)) throw new Error("Not an array");
      } catch {
        toast({
          title: "Search failed",
          description: "Could not parse results. Try a more specific search term.",
          variant: "destructive",
        });
        return;
      }

      const newCitations = papers.slice(0, 5).map((paper: any) => ({
        id: Date.now().toString() + Math.random(),
        title: paper.title ?? "Unknown Title",
        authors: Array.isArray(paper.authors)
          ? paper.authors
          : [String(paper.authors ?? "Unknown Author")],
        year: String(paper.year ?? new Date().getFullYear()),
        source: paper.source ?? "Unknown Source",
        type: "journal" as const,
        doi: paper.doi ?? undefined,
      }));

      onCitationsFound(newCitations);

      toast({
        title: "Search completed",
        description: `Found ${newCitations.length} relevant papers`,
      });
    } catch (error) {
      console.error("Error searching papers:", error);
      toast({
        title: "Search failed",
        description: "Could not find relevant papers. Please try again.",
        variant: "destructive",
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
