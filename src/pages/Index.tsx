
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Plus, BookOpen, FileText, Trash2, Edit, Calendar, Users } from "lucide-react";
import { WritingDashboard } from "@/components/WritingDashboard";
import { documentTemplates, type TemplateType } from "@/components/DocumentTemplates";

interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: Date;
  wordCount: number;
  collaborators: number;
}

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for projects
    const savedProjects = localStorage.getItem("writing-projects");
    if (savedProjects) {
      // Parse and ensure dates are converted back from strings
      const parsed = JSON.parse(savedProjects);
      const projectsWithDates = parsed.map((project: any) => ({
        ...project,
        lastEdited: new Date(project.lastEdited)
      }));
      setProjects(projectsWithDates);
    } else {
      // Create sample projects for demo
      const sampleProjects: Project[] = [
        {
          id: "1",
          name: "Research Paper on AI Ethics",
          description: "Investigating the ethical implications of artificial intelligence in healthcare",
          lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          wordCount: 2345,
          collaborators: 1
        },
        {
          id: "2",
          name: "Literature Review: Climate Science",
          description: "A comprehensive review of recent climate science publications",
          lastEdited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          wordCount: 4528,
          collaborators: 2
        },
        {
          id: "3",
          name: "Thesis Draft",
          description: "Working draft of my thesis on cognitive psychology",
          lastEdited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          wordCount: 12056,
          collaborators: 0
        }
      ];
      setProjects(sampleProjects);
      localStorage.setItem("writing-projects", JSON.stringify(sampleProjects));
    }
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("writing-projects", JSON.stringify(updatedProjects));
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your new project.",
        variant: "destructive",
      });
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: "A new writing project",
      lastEdited: new Date(),
      wordCount: 0,
      collaborators: 0
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setNewProjectName("");
    
    toast({
      title: "Project created",
      description: `"${newProjectName}" has been created successfully.`,
    });
    
    // Open the new project with research paper template
    setSelectedTemplate(documentTemplates[0]); // Research Paper template
    setActiveProject(newProjectName);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    saveProjects(updatedProjects);
    
    // Also delete any saved content
    const projectToDelete = projects.find(p => p.id === projectId);
    if (projectToDelete) {
      localStorage.removeItem(`draft-${projectToDelete.name}`);
    }
    
    toast({
      title: "Project deleted",
      description: "The project has been deleted successfully.",
    });
  };

  const handleOpenProject = (projectName: string) => {
    setActiveProject(projectName);
    // In a real app, you'd load project data here
  };

  const handleFeatureClick = (feature: string) => {
    // Create a new project for the demo feature
    const featureDemoName = `${feature} Demo`;
    
    // Find the right template based on feature
    let templateToUse;
    switch (feature) {
      case "AI-Powered Editor":
        templateToUse = documentTemplates[0]; // Research Paper
        break;
      case "Citation Manager":
        templateToUse = documentTemplates[1]; // Technical Report
        break;
      case "Progress Tracking":
        templateToUse = documentTemplates[0]; // Research Paper
        break;
      case "Research Assistant":
        templateToUse = documentTemplates[2]; // Case Study
        break;
      default:
        templateToUse = documentTemplates[0];
    }
    
    setSelectedTemplate(templateToUse);
    
    // Check if project already exists, if not create it
    if (!projects.some(p => p.name === featureDemoName)) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: featureDemoName,
        description: `A demo project for the ${feature} feature`,
        lastEdited: new Date(),
        wordCount: 0,
        collaborators: 0
      };
      
      const updatedProjects = [...projects, newProject];
      saveProjects(updatedProjects);
      
      toast({
        title: "Demo project created",
        description: `"${featureDemoName}" has been created to showcase the ${feature} feature.`,
      });
    }
    
    setActiveProject(featureDemoName);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (activeProject) {
    return (
      <WritingDashboard 
        projectName={activeProject}
        onClose={() => setActiveProject(null)}
        template={selectedTemplate}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fadeIn">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Academic Writing Assistant</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Enhance your academic writing with AI-powered tools for research, analysis, 
          and collaborative editing. Track your progress and get real-time feedback.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <Card className="w-full glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Your Writing Projects
              </CardTitle>
              <CardDescription>
                Manage, track and continue your writing projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any projects yet.</p>
                  <p className="text-gray-500">Create your first project to get started!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 
                                className="text-lg font-semibold mb-1 hover:text-blue-600 cursor-pointer"
                                onClick={() => handleOpenProject(project.name)}
                              >
                                {project.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(project.lastEdited)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{project.wordCount} words</span>
                                </div>
                                {project.collaborators > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{project.collaborators} collaborators</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenProject(project.name)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Open
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Input
                placeholder="New project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:w-1/3">
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Features & Tools
              </CardTitle>
              <CardDescription>
                Discover what our writing assistant can do for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="flex gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => handleFeatureClick("AI-Powered Editor")}
                >
                  <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">AI-Powered Editor</h3>
                    <p className="text-sm text-gray-600">
                      Smart writing suggestions and real-time grammar feedback as you write.
                    </p>
                  </div>
                </div>
                
                <div 
                  className="flex gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => handleFeatureClick("Citation Manager")}
                >
                  <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Citation Manager</h3>
                    <p className="text-sm text-gray-600">
                      Easily manage references and citations in multiple formats (APA, MLA, Chicago).
                    </p>
                  </div>
                </div>
                
                <div 
                  className="flex gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => handleFeatureClick("Progress Tracking")}
                >
                  <div className="bg-purple-100 text-purple-800 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Progress Tracking</h3>
                    <p className="text-sm text-gray-600">
                      Set goals, track your writing habits, and visualize your progress over time.
                    </p>
                  </div>
                </div>
                
                <div 
                  className="flex gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => handleFeatureClick("Research Assistant")}
                >
                  <div className="bg-amber-100 text-amber-800 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Research Assistant</h3>
                    <p className="text-sm text-gray-600">
                      AI-powered research tools to find relevant sources and generate insights.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
