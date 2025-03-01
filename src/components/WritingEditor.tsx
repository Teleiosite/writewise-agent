
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { downloadDocument, formatContent, type ExportFormat } from "@/utils/documentExport";
import type { TemplateType } from "./DocumentTemplates";
import { TextAnalysis } from "./TextAnalysis";
import { EditorSidebar } from "./editor/EditorSidebar";
import { EditorMain } from "./editor/EditorMain";
import { EditorToolbar } from "./editor/EditorToolbar";

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

export function WritingEditor({
  onClose,
  projectName,
  template,
  showCitations = false,
  showPdfReader = false
}: WritingEditorProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showCitationsPanel, setShowCitationsPanel] = useState(showCitations);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(showPdfReader);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
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

  const handleContentChange = (content: string) => {
    if (!activeSection) return;
    
    setSections(sections.map(section => 
      section.id === activeSection ? { ...section, content } : section
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
    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n" + citation;
      handleContentChange(newContent);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n\nSuggested improvement: " + suggestion;
      handleContentChange(newContent);
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

  const toggleCitationsPanel = () => {
    setShowCitationsPanel(!showCitationsPanel);
    if (showCitationsPanel) setShowPdfReaderPanel(false);
  };

  const togglePdfReaderPanel = () => {
    setShowPdfReaderPanel(!showPdfReaderPanel);
    if (showPdfReaderPanel) setShowCitationsPanel(false);
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-4">
      <EditorToolbar 
        onClose={onClose}
        onSave={handleSave}
        onExport={handleExport}
        wordCount={wordCount}
        readingTime={readingTime}
        lastSaved={lastSaved}
        showCitationsPanel={showCitationsPanel}
        showPdfReaderPanel={showPdfReaderPanel}
        onToggleCitations={toggleCitationsPanel}
        onTogglePdfReader={togglePdfReaderPanel}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <EditorSidebar 
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        <div className="md:col-span-6 space-y-4">
          <EditorMain 
            sectionTitle={currentSection?.title || ""}
            projectName={projectName}
            content={currentSection?.content || ""}
            onContentChange={handleContentChange}
            showCitationsPanel={showCitationsPanel}
            showPdfReaderPanel={showPdfReaderPanel}
            onToggleCitations={toggleCitationsPanel}
            onTogglePdfReader={togglePdfReaderPanel}
            onInsertCitation={handleInsertCitation}
          />
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
