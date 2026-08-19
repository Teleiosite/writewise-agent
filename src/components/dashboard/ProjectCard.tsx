import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Users, ArrowUpRight, Trash2 } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: Date;
  wordCount?: number;
  collaborators?: number;
}

interface ProjectCardProps {
  project: Project;
  onOpenProject: (projectName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectCard({ project, onOpenProject, onDeleteProject }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card key={project.id} className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black p-5 font-sans transition-all hover:border-black dark:hover:border-white shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 
            className="text-base font-bold mb-1 hover:underline cursor-pointer text-black dark:text-white flex items-center gap-1.5"
            onClick={() => onOpenProject(project.name)}
          >
            {project.name}
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mb-3 leading-relaxed">{project.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(project.lastEdited)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>{project.wordCount} words</span>
            </div>
            {project.collaborators > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{project.collaborators} collaborators</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            size="sm"
            onClick={() => onOpenProject(project.name)}
            className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-4"
          >
            Open Workspace
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 dark:text-red-400 border-zinc-300 dark:border-zinc-800 rounded-none hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => onDeleteProject(project.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
