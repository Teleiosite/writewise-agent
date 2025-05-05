
import { Tabs } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardTabContent } from "@/components/dashboard/DashboardTabContent";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import type { TemplateType } from "./DocumentTemplates";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface WritingDashboardProps {
  projectName: string;
  onClose: () => void;
  template?: TemplateType;
  activeFeature?: string | null;
}

export function WritingDashboard({ projectName, onClose, template, activeFeature }: WritingDashboardProps) {
  const { activeTab, setActiveTab } = useDashboardTabs(activeFeature);
  const isMobile = useIsMobile();

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <DashboardHeader projectName={projectName} onClose={onClose} />

      {isMobile && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Mobile View</AlertTitle>
          <AlertDescription>
            Some features may be optimized for desktop. For the best experience, consider using a larger screen.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />
        
        <DashboardTabContent 
          activeTab={activeTab}
          projectName={projectName}
          onClose={onClose}
          template={template}
          activeFeature={activeFeature}
        />
      </Tabs>
    </div>
  );
}
