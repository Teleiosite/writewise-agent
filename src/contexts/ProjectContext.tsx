
import React, { createContext, useState, useContext, useEffect } from "react";
import { type Project } from "@/components/dashboard/ProjectCard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  fetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    const { data: projects, error } = await supabase.from('projects').select('*');
    if (error) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const projectsWithDates = projects.map((project: any) => ({
        ...project,
        lastEdited: new Date(project.last_edited)
      }));
      setProjects(projectsWithDates);
      setFilteredProjects(projectsWithDates);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your new project.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to create a project.",
            variant: "destructive",
        });
        return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { name: newProjectName, description: 'A new writing project', user_id: user.id },
      ])
      .select();

    if (error) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchProjects();
      setNewProjectName("");
      toast({
        title: "Project created",
        description: `"${newProjectName}" has been created successfully.`,
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchProjects();
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    }
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
        fetchProjects
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
