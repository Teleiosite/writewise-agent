import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical } from "lucide-react";

interface CreateProjectCardProps {
  onCreateProject: () => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
}

export function CreateProjectCard({ onCreateProject, newProjectName, setNewProjectName }: CreateProjectCardProps) {
  return (
    <Card className="glass-card border-blue-200 dark:border-slate-800 shadow-md">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Create Research Project
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Start a new dissertation, research chapter, or data analysis project
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="e.g., Chapter 4: Financial Literacy Survey Analysis..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-grow h-10 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-800"
            onKeyDown={(e) => e.key === 'Enter' && onCreateProject()}
          />
          <Button 
            onClick={onCreateProject}
            className="h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
