import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { type Project } from "@/components/dashboard/ProjectCard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { documentTemplates } from "@/components/DocumentTemplates";
import { useNavigate } from "react-router-dom";

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
  handleFeatureClick: (feature: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const { data: dbProjects, error } = await supabase.from('projects').select('*').order('last_edited', { ascending: false });
      
      const localProjects: Project[] = JSON.parse(localStorage.getItem('writewise_local_projects') || '[]');

      if (!error && dbProjects) {
        // Filter out any legacy demo projects
        const cleanDbProjects = dbProjects.filter(p => !p.name.includes('Demo') && !p.name.includes('Progress Tracking'));
        const projectsWithDates = cleanDbProjects.map((project: any) => ({
          ...project,
          lastEdited: new Date(project.last_edited || project.created_at || Date.now())
        }));
        
        // Merge with local projects
        const map = new Map<string, Project>();
        projectsWithDates.forEach(p => map.set(p.id, p));
        localProjects.forEach(p => {
          if (!map.has(p.id)) map.set(p.id, { ...p, lastEdited: new Date(p.lastEdited || Date.now()) });
        });

        const merged = Array.from(map.values());
        setProjects(merged);
        setFilteredProjects(merged);
      } else {
        setProjects(localProjects);
        setFilteredProjects(localProjects);
      }
    } catch {
      const localProjects: Project[] = JSON.parse(localStorage.getItem('writewise_local_projects') || '[]');
      setProjects(localProjects);
      setFilteredProjects(localProjects);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Workspace Title Required",
        description: "Please enter a title for your research workspace.",
        variant: "destructive",
      });
      return;
    }

    let user = null;
    try {
      const res = await supabase.auth.getUser();
      user = res.data?.user;
    } catch {
      // ignore
    }

    const newProj: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      description: "Research Manuscript & Statistical Workspace",
      lastEdited: new Date(),
    };

    if (user) {
      try {
        const { error } = await supabase
          .from('projects')
          .insert([
            { id: newProj.id, name: newProj.name, description: newProj.description, user_id: user.id },
          ]);

        if (!error) {
          await fetchProjects();
          setNewProjectName("");
          toast({
            title: "Workspace Created",
            description: `"${newProj.name}" has been created successfully.`,
          });
          setActiveProject(newProj.name);
          return;
        }
      } catch (err: any) {
        console.warn("Supabase project insert failed, saving locally:", err);
      }
    }

    // Local Storage Fallback
    const localProjects: Project[] = JSON.parse(localStorage.getItem('writewise_local_projects') || '[]');
    const updated = [newProj, ...localProjects];
    localStorage.setItem('writewise_local_projects', JSON.stringify(updated));
    setProjects(updated);
    setFilteredProjects(updated);
    setNewProjectName("");
    toast({
      title: "Workspace Created",
      description: `"${newProj.name}" has been created successfully.`,
    });
    setActiveProject(newProj.name);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await supabase.from('projects').delete().eq('id', projectId);
    } catch {
      // ignore
    }

    const localProjects: Project[] = JSON.parse(localStorage.getItem('writewise_local_projects') || '[]');
    const filtered = localProjects.filter(p => p.id !== projectId);
    localStorage.setItem('writewise_local_projects', JSON.stringify(filtered));

    setProjects(prev => prev.filter(p => p.id !== projectId));
    setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Workspace Deleted",
      description: "The research workspace has been removed.",
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

  const handleFeatureClick = (feature: string) => {
    if (feature === "AI Data Analysis") {
      navigate('/data-analysis');
      return;
    }

    if (feature === "Chapter Claim Auditor") {
      navigate('/claim-auditor');
      return;
    }

    if (feature === "AI-Powered Editor") {
      const projName = projects[0]?.name || "Research Manuscript";
      localStorage.setItem("active-feature", "AI-Powered Editor");
      setActiveProject(projName);
      return;
    }

    if (feature === "Citation Manager") {
      const projName = projects[0]?.name || "Research Manuscript";
      localStorage.setItem("selected-template", JSON.stringify(documentTemplates[1]));
      localStorage.setItem("active-feature", "Citation Manager");
      localStorage.setItem("show-citation-manager", "true");
      setActiveProject(projName);
      return;
    }

    if (feature === "Research Assistant") {
      const projName = projects[0]?.name || "Research Manuscript";
      localStorage.setItem("selected-template", JSON.stringify(documentTemplates[2]));
      localStorage.setItem("active-feature", "Research Assistant");
      setActiveProject(projName);
      return;
    }

    if (feature === "Read PDF & Chat") {
      const projName = projects[0]?.name || "Research Manuscript";
      localStorage.setItem("active-feature", "Read PDF & Chat");
      localStorage.setItem("show-pdf-reader", "true");
      setActiveProject(projName);
      return;
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
        fetchProjects,
        handleFeatureClick,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
