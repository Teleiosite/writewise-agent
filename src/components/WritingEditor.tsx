
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Save,
  FileText,
  Quote,
  BookOpen,
  ChevronLeft,
  Clock,
  BookmarkIcon,
  Download,
  FileUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TemplateType } from "./DocumentTemplates";
import { CitationManager } from "./CitationManager";
import { TextAnalysis } from "./TextAnalysis";
import { downloadDocument, formatContent, type ExportFormat } from "@/utils/documentExport";

interface WritingEditorProps {
  onClose: () => void;
  projectName: string;
  template?: TemplateType;
  showCitations?: boolean;
  showPdfReader?: boolean;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

export function WritingEditor({ onClose, projectName, template, showCitations = false, showPdfReader = false }: WritingEditorProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showCitationsPanel, setShowCitationsPanel] = useState(showCitations);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(showPdfReader);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pdfContent, setPdfContent] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("Template in WritingEditor:", template);
    
    // Check if we have saved content
    const savedContent = localStorage.getItem(`draft-${projectName}`);
    
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setSections(parsed.sections || []);
        setLastSaved(new Date(parsed.lastSaved));
        if (parsed.sections && parsed.sections.length > 0) {
          setActiveSection(parsed.sections[0].id);
        }
      } catch (error) {
        console.error("Error parsing saved content:", error);
        initializeFromTemplateOrDefault();
      }
    } else {
      initializeFromTemplateOrDefault();
    }
    
    // Check if we should show the citation manager
    const shouldShowCitations = localStorage.getItem("show-citation-manager") === "true";
    if (shouldShowCitations) {
      setShowCitationsPanel(true);
      // Clear the flag
      localStorage.removeItem("show-citation-manager");
    }
    
    // Check if we should show the PDF Reader
    const shouldShowPdfReader = localStorage.getItem("show-pdf-reader") === "true";
    if (shouldShowPdfReader) {
      setShowPdfReaderPanel(true);
      // Clear the flag
      localStorage.removeItem("show-pdf-reader");
    }
  }, [template, projectName, showCitations, showPdfReader]);

  const initializeFromTemplateOrDefault = () => {
    // If we have a template with sections, use that
    if (template && template.sections && Array.isArray(template.sections) && template.sections.length > 0) {
      console.log("Creating sections from template:", template.sections);
      const initialSections = template.sections.map((title) => ({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        content: "",
      }));
      
      console.log("Initialized sections from template:", initialSections);
      setSections(initialSections);
      
      if (initialSections.length > 0) {
        setActiveSection(initialSections[0].id);
      }
    } else {
      // Fallback to default
      initializeDefaultSections();
    }
  };

  const initializeDefaultSections = () => {
    console.log("Initializing default sections");
    const defaultSections: Section[] = [
      { id: "main-content", title: "Main Content", content: "" }
    ];
    setSections(defaultSections);
    setActiveSection("main-content");
  };

  const handleContentChange = (sectionId: string, content: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));

    const words = content.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  };

  const handleSave = () => {
    const currentTime = new Date();
    const saveData = {
      sections,
      lastSaved: currentTime.toISOString(),
    };
    localStorage.setItem(`draft-${projectName}`, JSON.stringify(saveData));
    setLastSaved(currentTime);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved successfully.",
    });
  };

  const handleInsertCitation = (citation: string) => {
    const newContent = currentSection?.content + "\n" + citation;
    if (currentSection) {
      handleContentChange(currentSection.id, newContent);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (currentSection) {
      const newContent = currentSection.content + "\n\nSuggested improvement: " + suggestion;
      handleContentChange(currentSection.id, newContent);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    const content = await formatContent(sections, format);
    await downloadDocument(content, projectName, format);
    toast({
      title: "Document exported",
      description: `Your document has been exported as ${format.toUpperCase()}`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept PDF files
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would parse the PDF content
    // For demo, we'll simulate extraction
    const reader = new FileReader();
    reader.onload = () => {
      // Set some sample extracted text
      setPdfContent(`[PDF Content Extracted from: ${file.name}]
      
This would be the actual content extracted from the PDF document. In a real application, the PDF would be parsed and its text content would be extracted here.

The system would analyze headings, paragraphs, tables, and other elements to provide structured content that you can work with.

Key information such as:
- Authors: John Smith, Jane Doe
- Publication date: October 2023
- Abstract: The study investigates the effects of climate change on coastal ecosystems...

You can select any portion of this text to add to your document, or click "Add to Document" to include the entire extracted content in your current section.`);
      
      toast({
        title: "PDF uploaded",
        description: `"${file.name}" has been uploaded and analyzed.`,
      });
    };
    reader.readAsText(file);
  };

  const handleAddPdfContent = () => {
    if (!pdfContent || !currentSection) return;
    
    const newContent = currentSection.content + "\n\n" + pdfContent;
    handleContentChange(currentSection.id, newContent);
    
    toast({
      title: "Content added",
      description: "PDF content has been added to your document.",
    });
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const formattedLastSaved = lastSaved 
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(lastSaved)
    : null;

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
            {formattedLastSaved && (
              <>
                <span>•</span>
                <span>Last saved at {formattedLastSaved}</span>
              </>
            )}
          </div>
          <Button 
            variant="outline"
            onClick={handleSave}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <Download className="mr-2 h-4 w-4" />
                Plain Text (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('md')}>
                <Download className="mr-2 h-4 w-4" />
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                <Download className="mr-2 h-4 w-4" />
                HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                PDF Document (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('doc')}>
                <Download className="mr-2 h-4 w-4" />
                Word Document (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                {sections && sections.length > 0 ? (
                  sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No sections available
                  </div>
                )}
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
                  variant={showCitationsPanel ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowCitationsPanel(!showCitationsPanel);
                    if (showCitationsPanel) setShowPdfReaderPanel(false);
                  }}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button 
                  variant={showPdfReaderPanel ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowPdfReaderPanel(!showPdfReaderPanel);
                    if (showPdfReaderPanel) setShowCitationsPanel(false);
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showCitationsPanel && (
              <div className="mb-4">
                <CitationManager onInsertCitation={handleInsertCitation} />
              </div>
            )}
            
            {showPdfReaderPanel && (
              <div className="mb-4">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">PDF Reader</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('pdf-file-upload')?.click()}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Upload PDF
                      </Button>
                      <input
                        id="pdf-file-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    {pdfContent ? (
                      <>
                        <ScrollArea className="h-[200px] border rounded-md p-3">
                          <div className="whitespace-pre-wrap">{pdfContent}</div>
                        </ScrollArea>
                        
                        <Button 
                          className="w-full"
                          onClick={handleAddPdfContent}
                        >
                          Add to Document
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-gray-500">Upload a PDF file to extract and analyze its content.</p>
                      </div>
                    )}
                  </div>
                </Card>
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
          <TextAnalysis
            content={currentSection?.content || ""}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>
    </div>
  );
}
