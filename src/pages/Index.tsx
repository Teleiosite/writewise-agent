
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Plus, BookOpen, FileText, Trash2, Edit, Calendar, Users, AlertTriangle, Menu } from "lucide-react";
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
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setActiveFeature(null);
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
      case "AI Detector":
        templateToUse = documentTemplates[0]; // Research Paper
        break;
      case "Text Humanizer":
        templateToUse = documentTemplates[0]; // Research Paper
        break;
      case "Read PDF":
        templateToUse = documentTemplates[0]; // Research Paper
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
    setActiveFeature(feature);
    
    // Close mobile menu after selection
    setMobileMenuOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const features = [
    {
      name: "AI-Powered Editor",
      description: "Smart writing suggestions and real-time grammar feedback as you write.",
      icon: FileText,
      color: "blue"
    },
    {
      name: "Citation Manager",
      description: "Easily manage references and citations in multiple formats (APA, MLA, Chicago).",
      icon: Users,
      color: "green"
    },
    {
      name: "Progress Tracking",
      description: "Set goals, track your writing habits, and visualize your progress over time.",
      icon: Calendar,
      color: "purple"
    },
    {
      name: "Research Assistant",
      description: "AI-powered research tools to find relevant sources and generate insights.",
      icon: BookOpen,
      color: "amber"
    },
    {
      name: "AI Detector",
      description: "Analyze text to determine if it was likely created by AI. Perfect for educators and reviewers.",
      icon: AlertTriangle,
      color: "red"
    },
    {
      name: "Text Humanizer",
      description: "Transform AI-generated content into natural-sounding text that passes AI detection.",
      icon: FileText,
      color: "indigo"
    },
    {
      name: "Read PDF",
      description: "Import and analyze PDF documents to extract key information and insights.",
      icon: FileText,
      color: "orange"
    }
  ];

  if (activeProject) {
    return (
      <WritingDashboard 
        projectName={activeProject}
        onClose={() => {
          setActiveProject(null);
          setActiveFeature(null);
        }}
        template={selectedTemplate}
        activeFeature={activeFeature}
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
      
      {/* Mobile Menu Toggle Button - Only visible on small screens */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          {/* Create Project Section */}
          <div className="mb-8 animate-pulse hover:animate-none">
            <Card className="border-2 border-blue-400 shadow-lg animate-scale-in">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New Project
                </CardTitle>
                <CardDescription>
                  Start a new writing project with our AI-powered tools
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-3">
                  <Input
                    placeholder="Enter your project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="flex-grow focus:ring-2 focus:ring-blue-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                  <Button 
                    onClick={handleCreateProject}
                    className="bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2 animate-bounce" />
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Your Writing Projects Section */}
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
                      <Card key={project.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 
                                className="text-lg font-semibold mb-1 hover:text-blue-600 cursor-pointer transition-colors"
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
                                className="hover:bg-blue-50 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-1" /> Open
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
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
          </Card>
        </div>
        
        {/* Side Menu - Features & Tools */}
        <div className={`
          fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          md:static md:w-1/4 md:translate-x-0 md:shadow-none
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold">Features & Tools</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                &times;
              </Button>
            </div>
            
            <ScrollArea className="flex-1 py-2">
              <div className="px-2 space-y-1">
                {features.map((feature) => (
                  <button
                    key={feature.name}
                    onClick={() => handleFeatureClick(feature.name)}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`bg-${feature.color}-100 text-${feature.color}-800 rounded-full w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-1">{feature.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                <p className="font-medium mb-1">Need Help?</p>
                <p className="text-xs">Access our comprehensive documentation or contact support for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
