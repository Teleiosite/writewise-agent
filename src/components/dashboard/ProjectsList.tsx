import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, FolderPlus, FileText } from "lucide-react";
import { ProjectCard, type Project } from "./ProjectCard";
import { useNavigate } from "react-router-dom";

interface ProjectsListProps {
  projects: Project[];
  onOpenProject: (projectName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectsList({ projects, onOpenProject, onDeleteProject }: ProjectsListProps) {
  const navigate = useNavigate();

  return (
    <Card className="w-full glass-card mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Your Research Workspaces
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Manage your statistical analyses, draft chapters, and citations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              No research projects yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Create your first project above, or jump straight into running statistical analysis on your dataset.
            </p>
            <Button 
              onClick={() => navigate('/data-analysis')} 
              variant="outline"
              size="sm"
              className="gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold"
            >
              <FlaskConical className="w-4 h-4" />
              Launch Statistical Engine Directly
            </Button>
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
