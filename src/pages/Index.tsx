
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, BookText, FileText, BookOpen, PenTool } from "lucide-react";
import { WritingEditor } from "@/components/WritingEditor";
import { DocumentTemplates, type TemplateType } from "@/components/DocumentTemplates";

const Index = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleNewProject = () => {
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    setActiveProject("new");
    setShowTemplates(false);
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
                    <h2 className="text-xl font-semibold">Recent Projects</h2>
                  </div>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {["Research Paper", "Technical Documentation", "Project Analysis"].map((project) => (
                        <Button
                          key={project}
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-indigo-50"
                          onClick={() => setActiveProject(project)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          {project}
                        </Button>
                      ))}
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
          }}
          projectName={activeProject}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default Index;
