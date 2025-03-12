
import React, { createContext, useState, useContext, useEffect } from "react";
import { type Project } from "@/components/dashboard/ProjectCard";
import { useToast } from "@/components/ui/use-toast";

interface ProjectContextType {
  projects: Project[];
  filteredProjects: Project[];
  newProjectName: string;
  activeProject: string | null;
  setNewProjectName: (name: string) => void;
  setActiveProject: (name: string | null) => void;
  handleCreateProject: () => void;
  handleDeleteProject: (projectId: string) => void;
  handleOpenProject: (projectName: string) => void;
  handleSearch: (searchTerm: string) => void;
  saveProjects: (updatedProjects: Project[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
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
      setFilteredProjects(projectsWithDates);
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
      setFilteredProjects(sampleProjects);
      localStorage.setItem("writing-projects", JSON.stringify(sampleProjects));
    }
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    setFilteredProjects(updatedProjects);
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
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = projects.filter(
        project => 
          project.name.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term)
      );
      setFilteredProjects(filtered);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        filteredProjects,
        newProjectName,
        activeProject,
        setNewProjectName,
        setActiveProject,
        handleCreateProject,
        handleDeleteProject,
        handleOpenProject,
        handleSearch,
        saveProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
