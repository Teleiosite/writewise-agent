
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Users, Edit, Trash2 } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: Date;
  wordCount: number;
  collaborators: number;
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
    <Card key={project.id} className="overflow-hidden transition-all duration-300 hover:shadow-md dark:hoverable-card">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 
              className="text-lg font-semibold mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              onClick={() => onOpenProject(project.name)}
            >
              {project.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
              onClick={() => onOpenProject(project.name)}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" /> Open
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={() => onDeleteProject(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
