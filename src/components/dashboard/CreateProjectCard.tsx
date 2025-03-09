
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onCreateProject: () => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
}

export function CreateProjectCard({ onCreateProject, newProjectName, setNewProjectName }: CreateProjectCardProps) {
  return (
    <Card className="border-2 border-blue-400 dark:border-blue-700 shadow-lg dark:shadow-blue-900/20 animate-scale-in">
      <CardHeader className="bg-blue-50 dark:bg-blue-950/40 dark:backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Create New Project
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Start a new writing project with our AI-powered tools
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Enter your project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-grow focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 dark:bg-slate-800/50 dark:border-slate-700"
            onKeyDown={(e) => e.key === 'Enter' && onCreateProject()}
          />
          <Button 
            onClick={onCreateProject}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 transition-all transform hover:scale-105"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2 animate-bounce" />
            Create Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
