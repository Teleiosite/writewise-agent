
import React from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectSearch } from "./ProjectSearch";
import { CreateProjectCard } from "./CreateProjectCard";
import { ProjectsList } from "./ProjectsList";
import { FeaturesDashboard } from "./FeaturesDashboard";

export function Dashboard() {
  const { 
    filteredProjects, 
    newProjectName, 
    setNewProjectName, 
    handleCreateProject, 
    handleOpenProject, 
    handleDeleteProject,
    handleSearch
  } = useProjects();

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <FeaturesDashboard />
      
      <div className="w-full md:w-3/4">
        <ProjectSearch onSearch={handleSearch} />
        
        <div className="mb-8 animate-pulse hover:animate-none">
          <CreateProjectCard
            onCreateProject={handleCreateProject}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
          />
        </div>
        
        <ProjectsList
          projects={filteredProjects}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>
    </div>
  );
}
