import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, FolderPlus, FileText, ArrowRight } from "lucide-react";
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
    <Card className="w-full rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans mb-6">
      <CardHeader className="pb-3 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base font-bold tracking-tight">
          <FileText className="h-4 w-4" />
          Active Research Workspaces
        </CardTitle>
        <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
          Manage your statistical analyses, thesis chapters, and bibliography assets
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-black dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="w-10 h-10 border border-black dark:border-zinc-700 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center mx-auto mb-3 font-mono">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-black dark:text-white text-sm mb-1">
              No research projects created yet
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mb-5 leading-relaxed">
              Create your workspace above or jump straight into uploading your dataset to run Python statistics & generate SPSS syntax.
            </p>
            <Button 
              onClick={() => navigate('/data-analysis')} 
              size="sm"
              className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-4 border border-black dark:border-white"
            >
              <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
              Launch Statistical Engine <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
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
