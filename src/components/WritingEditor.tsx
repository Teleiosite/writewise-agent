import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Save,
  FileText,
  Quote,
  BookOpen,
  ChevronLeft,
  PenTool,
  Clock,
  BookmarkIcon,
} from "lucide-react";
import type { TemplateType } from "./DocumentTemplates";
import { CitationManager } from "./CitationManager";

interface WritingEditorProps {
  onClose: () => void;
  projectName: string;
  template?: TemplateType;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

export function WritingEditor({ onClose, projectName, template }: WritingEditorProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showCitations, setShowCitations] = useState(false);

  useEffect(() => {
    if (template) {
      const initialSections = template.sections.map((title) => ({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        content: "",
      }));
      setSections(initialSections);
      setActiveSection(initialSections[0]?.id || "");
    }
  }, [template]);

  const handleContentChange = (sectionId: string, content: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));

    const words = content.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Assuming 200 words per minute reading speed

    setSuggestions([
      "Consider adding more details about the methodology",
      "The introduction could be more engaging",
      "Add supporting evidence for this claim",
    ]);
  };

  const handleInsertCitation = (citation: string) => {
    const newContent = currentSection?.content + "\n" + citation;
    if (currentSection) {
      handleContentChange(currentSection.id, newContent);
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onClose}
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{readingTime} min read</span>
            <span>•</span>
            <span>{wordCount} words</span>
          </div>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <Card className="glass-card p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <BookmarkIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Sections</h3>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="md:col-span-6 space-y-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{currentSection?.title || projectName}</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCitations(!showCitations)}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showCitations && (
              <div className="mb-4">
                <CitationManager onInsertCitation={handleInsertCitation} />
              </div>
            )}
            <Textarea
              value={currentSection?.content || ""}
              onChange={(e) => handleContentChange(activeSection, e.target.value)}
              placeholder={`Start writing your ${currentSection?.title || "project"}...`}
              className="min-h-[500px] resize-none"
            />
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-4">
              <PenTool className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">AI Suggestions</h3>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-3 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <p className="text-sm text-gray-600">{suggestion}</p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
