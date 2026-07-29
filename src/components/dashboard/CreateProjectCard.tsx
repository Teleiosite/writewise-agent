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
    <Card className="border border-black dark:border-zinc-800 rounded-none shadow-none bg-white dark:bg-black font-sans">
      <CardHeader className="bg-zinc-50 dark:bg-zinc-950 pb-3 border-b border-black dark:border-zinc-800">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-black dark:text-white">
          <FlaskConical className="h-4 w-4" />
          Create Research Workspace
        </CardTitle>
        <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
          Start a new dissertation chapter, empirical survey, or statistical analysis project
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="e.g., Chapter 4: Entrepreneurship Survey Analysis..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-grow h-10 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
            onKeyDown={(e) => e.key === 'Enter' && onCreateProject()}
          />
          <Button 
            onClick={onCreateProject}
            className="h-10 font-mono text-xs uppercase tracking-wider bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
