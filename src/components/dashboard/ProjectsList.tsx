
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ProjectCard, type Project } from "./ProjectCard";

interface ProjectsListProps {
  projects: Project[];
  onOpenProject: (projectName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectsList({ projects, onOpenProject, onDeleteProject }: ProjectsListProps) {
  return (
    <Card className="w-full glass-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Your Writing Projects
        </CardTitle>
        <CardDescription>
          Manage, track and continue your writing projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">You don't have any projects yet.</p>
            <p className="text-gray-500 dark:text-gray-400">Create your first project to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  onOpenProject={onOpenProject}
                  onDeleteProject={onDeleteProject}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
