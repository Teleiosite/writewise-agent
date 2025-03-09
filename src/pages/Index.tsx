
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";
import { WritingDashboard } from "@/components/WritingDashboard";
import { documentTemplates, type TemplateType } from "@/components/DocumentTemplates";
import { FeaturesSidebar } from "@/components/dashboard/FeaturesSidebar";
import { CreateProjectCard } from "@/components/dashboard/CreateProjectCard";
import { ProjectsList } from "@/components/dashboard/ProjectsList";
import { type Project } from "@/components/dashboard/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>(undefined);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedProjects = localStorage.getItem("writing-projects");
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      const projectsWithDates = parsed.map((project: any) => ({
        ...project,
        lastEdited: new Date(project.lastEdited)
      }));
      setProjects(projectsWithDates);
    } else {
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
    
    setSelectedTemplate(documentTemplates[0]);
    setActiveProject(newProjectName);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    saveProjects(updatedProjects);
    
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
  };

  const handleFeatureClick = (feature: string) => {
    const featureDemoName = `${feature} Demo`;
    
    let templateToUse;
    switch (feature) {
      case "AI-Powered Editor":
        templateToUse = documentTemplates[0];
        break;
      case "Citation Manager":
        templateToUse = documentTemplates[1];
        break;
      case "Progress Tracking":
        templateToUse = documentTemplates[0];
        break;
      case "Research Assistant":
        templateToUse = documentTemplates[2];
        break;
      case "AI Detector":
        templateToUse = documentTemplates[0];
        break;
      case "Text Humanizer":
        templateToUse = documentTemplates[0];
        break;
      case "Read PDF":
        templateToUse = documentTemplates[0];
        break;
      default:
        templateToUse = documentTemplates[0];
    }
    
    setSelectedTemplate(templateToUse);
    
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
    
    setMobileMenuOpen(false);
  };

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
      <div className="mb-8 text-center relative">
        <div className="absolute top-0 right-0 md:right-8">
          <ThemeToggle />
        </div>
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Academic Writing Assistant</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Enhance your academic writing with AI-powered tools for research, analysis, 
          and collaborative editing. Track your progress and get real-time feedback.
        </p>
      </div>
      
      <div className="md:hidden fixed top-4 left-4 z-50">
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
        <FeaturesSidebar 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onFeatureClick={handleFeatureClick}
        />
        
        <div className="w-full md:w-3/4">
          <div className="mb-8 animate-pulse hover:animate-none">
            <CreateProjectCard
              onCreateProject={handleCreateProject}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
            />
          </div>
          
          <ProjectsList
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </div>
    </div>
  );
}
