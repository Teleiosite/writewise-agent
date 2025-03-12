
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface DashboardHeaderProps {
  projectName: string;
  onClose: () => void;
}

export function DashboardHeader({ projectName, onClose }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        onClick={onClose}
        className="group"
      >
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </Button>
      <h1 className="text-2xl font-bold">{projectName}</h1>
    </div>
  );
}
