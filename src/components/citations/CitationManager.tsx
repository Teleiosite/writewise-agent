import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, BookOpen, Download, Upload, Copy, 
  Check, FileText, Sparkles, FolderArchive 
} from "lucide-react";
import { toast } from "sonner";
import { 
  AcademicCitation, 
  CitationStyle, 
  generateCompleteBibliography 
} from "@/services/citationEngine";
import { CitationSearch } from "./CitationSearch";
import { CitationList } from "./CitationList";
import { CitationForm } from "./CitationForm";
import { CitationImportExport } from "./CitationImportExport";
import { CitationStyleSelector } from "./CitationStyleSelector";
import { CitationManagerProps } from "./types";

const INITIAL_DEMO_CITATIONS: AcademicCitation[] = [
  {
    id: "vaswani2017",
    title: "Attention Is All You Need",
    authors: [
      { family: "Vaswani", given: "Ashish" },
      { family: "Shazeer", given: "Noam" },
      { family: "Parmar", given: "Niki" },
      { family: "Uszkoreit", given: "Jakob" },
      { family: "Jones", given: "Llion" },
      { family: "Gomez", given: "Aidan N." },
      { family: "Kaiser", given: "Lukasz" },
      { family: "Polosukhin", given: "Illia" }
    ],
    year: "2017",
    source: "Advances in Neural Information Processing Systems",
    volume: "30",
    pages: "5998-6008",
    type: "conference",
    doi: "10.48550/arXiv.1706.03762",
    url: "https://arxiv.org/abs/1706.03762",
    citationCount: 94000,
    sourceDatabase: "arXiv"
  },
  {
    id: "kahneman1979",
    title: "Prospect Theory: An Analysis of Decision under Risk",
    authors: [
      { family: "Kahneman", given: "Daniel" },
      { family: "Tversky", given: "Amos" }
    ],
    year: "1979",
    source: "Econometrica",
    volume: "47",
    issue: "2",
    pages: "263-291",
    type: "journal",
    doi: "10.2307/1914185",
    citationCount: 65000,
    sourceDatabase: "Crossref"
  }
];

export function CitationManager({ onInsertCitation, onInsertBibliography }: CitationManagerProps) {
  const [citations, setCitations] = useState<AcademicCitation[]>(() => {
    try {
      const saved = localStorage.getItem("writewise_academic_citations");
      return saved ? JSON.parse(saved) : INITIAL_DEMO_CITATIONS;
    } catch {
      return INITIAL_DEMO_CITATIONS;
    }
  });

  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("APA");
  const [activeTab, setActiveTab] = useState<'library' | 'search' | 'import' | 'manual'>('search');
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("writewise_academic_citations", JSON.stringify(citations));
    } catch (e) {
      console.warn("Could not persist citations to localStorage:", e);
    }
  }, [citations]);

  const handleAddCitation = (citation: AcademicCitation) => {
    setCitations((prev) => {
      // Avoid duplicate IDs or duplicate DOIs
      if (prev.some(c => c.id === citation.id || (c.doi && citation.doi && c.doi.toLowerCase() === citation.doi.toLowerCase()))) {
        return prev;
      }
      return [citation, ...prev];
    });
  };

  const handleBatchImport = (newCitations: AcademicCitation[]) => {
    setCitations((prev) => {
      const seen = new Set(prev.map(c => c.doi?.toLowerCase() || c.title.toLowerCase()));
      const filtered = newCitations.filter(c => {
        const key = c.doi?.toLowerCase() || c.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return [...filtered, ...prev];
    });
    setActiveTab('library');
  };

  const handleDeleteCitation = (id: string) => {
    setCitations(prev => prev.filter(c => c.id !== id));
    toast.success("Citation removed from workspace library");
  };

  const handleInsertCompleteBibliography = () => {
    if (citations.length === 0) {
      toast.error("Your citation library is empty.");
      return;
    }

    const fullBibliography = generateCompleteBibliography(citations, selectedStyle);
    
    if (onInsertBibliography) {
      onInsertBibliography(fullBibliography);
    } else {
      onInsertCitation(`\n\n### References\n\n${fullBibliography}\n`);
    }

    toast.success(`Inserted complete ${selectedStyle} References list (${citations.length} items)`);
  };

  return (
    <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
      {/* Top Header */}
      <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono-badge text-[10px]">Reference Suite</span>
            <span className="text-xs font-mono text-zinc-500">Crossref · OpenAlex · arXiv</span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-black dark:text-white mt-1">
            Academic Citation Engine
          </h3>
        </div>

        <CitationStyleSelector 
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center border-b border-black dark:border-zinc-800 font-mono text-xs uppercase tracking-wider bg-white dark:bg-black overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-r border-black dark:border-zinc-800 transition-colors whitespace-nowrap ${
            activeTab === 'search'
              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Global Search (350M+)</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-r border-black dark:border-zinc-800 transition-colors whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>My Library ({citations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-r border-black dark:border-zinc-800 transition-colors whitespace-nowrap ${
            activeTab === 'import'
              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>BibTeX &amp; RIS Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors whitespace-nowrap ${
            activeTab === 'manual'
              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'search' && (
          <CitationSearch 
            onCitationsFound={(found) => {
              found.forEach(handleAddCitation);
              setActiveTab('library');
            }} 
            onAddSingleCitation={handleAddCitation} 
          />
        )}

        {activeTab === 'library' && (
          <div className="space-y-4">
            {citations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {citations.length} verified academic references in workspace
                </span>
                <Button
                  size="sm"
                  onClick={handleInsertCompleteBibliography}
                  className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider h-8 px-4 border border-black dark:border-white"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Insert Complete Reference List
                </Button>
              </div>
            )}

            <CitationList 
              citations={citations}
              selectedStyle={selectedStyle}
              onSelectCitation={onInsertCitation}
              onDeleteCitation={handleDeleteCitation}
            />
          </div>
        )}

        {activeTab === 'import' && (
          <CitationImportExport 
            citations={citations}
            onImportCitations={handleBatchImport}
            currentStyle={selectedStyle}
          />
        )}

        {activeTab === 'manual' && (
          <CitationForm 
            onSave={(citation) => {
              handleAddCitation(citation);
              setActiveTab('library');
              toast.success(`Saved reference: "${citation.title.substring(0, 30)}..."`);
            }}
            onCancel={() => setActiveTab('library')}
          />
        )}
      </div>
    </Card>
  );
}
