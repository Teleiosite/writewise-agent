
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, BookText, FileText, BookOpen, PenTool, Trash2 } from "lucide-react";
import { WritingEditor } from "@/components/WritingEditor";
import { DocumentTemplates, type TemplateType } from "@/components/DocumentTemplates";
import { useToast } from "@/components/ui/use-toast";

interface SavedDraft {
  name: string;
  lastSaved: string;
}

const Index = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load all saved drafts from localStorage
    const drafts: SavedDraft[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('draft-')) {
        const draftData = JSON.parse(localStorage.getItem(key) || '{}');
        drafts.push({
          name: key.replace('draft-', ''),
          lastSaved: draftData.lastSaved,
        });
      }
    }
    // Sort drafts by last saved date, most recent first
    drafts.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
    setSavedDrafts(drafts);
  }, []);

  const handleNewProject = () => {
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    setActiveProject("new");
    setShowTemplates(false);
  };

  const handleDeleteDraft = (draftName: string) => {
    localStorage.removeItem(`draft-${draftName}`);
    setSavedDrafts(savedDrafts.filter(draft => draft.name !== draftName));
    toast({
      title: "Draft deleted",
      description: "Your draft has been deleted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {!activeProject ? (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">WriteWise Agent</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your intelligent writing assistant for comprehensive project documentation and analysis
            </p>
          </header>

          {showTemplates ? (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setShowTemplates(false)}
                className="group"
              >
                <ChevronRight className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
                Back
              </Button>
              <DocumentTemplates onSelect={handleTemplateSelect} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card p-6 space-y-4 hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold">New Project</h2>
                  </div>
                  <p className="text-gray-600">Start a fresh project with AI-powered writing assistance</p>
                  <Button
                    onClick={handleNewProject}
                    className="w-full group"
                  >
                    Create Project
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>

                <Card className="glass-card p-6 space-y-4 hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-indigo-100">
                      <BookText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold">Saved Drafts</h2>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {savedDrafts.length > 0 ? (
                        savedDrafts.map((draft) => (
                          <div 
                            key={draft.name}
                            className="flex items-center justify-between p-2 hover:bg-indigo-50 rounded-lg group"
                          >
                            <Button
                              variant="ghost"
                              className="flex-1 justify-start text-left hover:bg-transparent"
                              onClick={() => setActiveProject(draft.name)}
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{draft.name}</span>
                                <span className="text-xs text-gray-500">
                                  Last edited: {new Date(draft.lastSaved).toLocaleDateString()}
                                </span>
                              </div>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteDraft(draft.name)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center p-4">No saved drafts yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <PenTool className="w-6 h-6 text-purple-600" />,
                    title: "Smart Writing",
                    description: "AI-powered writing assistance with real-time suggestions",
                  },
                  {
                    icon: <BookText className="w-6 h-6 text-green-600" />,
                    title: "Citation Management",
                    description: "Automatic citation generation in multiple formats",
                  },
                  {
                    icon: <FileText className="w-6 h-6 text-blue-600" />,
                    title: "Project Analysis",
                    description: "Comprehensive analysis tools for your projects",
                  },
                ].map((feature, index) => (
                  <Card key={index} className="glass-card p-6 space-y-4">
                    <div className="p-3 rounded-full bg-gray-100 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <WritingEditor
          onClose={() => {
            setActiveProject(null);
            setSelectedTemplate(undefined);
            // Refresh the drafts list when closing the editor
            const drafts = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith('draft-')) {
                const draftData = JSON.parse(localStorage.getItem(key) || '{}');
                drafts.push({
                  name: key.replace('draft-', ''),
                  lastSaved: draftData.lastSaved,
                });
              }
            }
            drafts.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
            setSavedDrafts(drafts);
          }}
          projectName={activeProject}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default Index;
