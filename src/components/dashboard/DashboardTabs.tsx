import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, AlertTriangle } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  onChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <TabsList className="grid grid-cols-4 gap-2 font-mono text-xs">
      <TabsTrigger value="editor" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Editor</span>
      </TabsTrigger>
      <TabsTrigger value="assistant" className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span>Assistant</span>
      </TabsTrigger>
      <TabsTrigger value="ai-detector" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>AI Detector</span>
      </TabsTrigger>
      <TabsTrigger value="humanizer" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Humanizer</span>
      </TabsTrigger>
    </TabsList>
  );
}
