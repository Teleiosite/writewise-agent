
import { Tabs } from "@/components/ui/tabs";
import { DashboardTabContent } from "@/components/dashboard/DashboardTabContent";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import type { TemplateType } from "./DocumentTemplates";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { EditorProvider, useEditor } from "@/contexts/editor";
import { EditorHeader } from "./editor/EditorHeader";

interface WritingDashboardProps {
  projectName: string;
  onClose: () => void;
  template?: TemplateType;
  activeFeature?: string | null;
}

// Internal component to use the Editor Context for the header
function ProjectHeader({ 
  projectName, 
  onClose, 
  activeTab, 
  setActiveTab 
}: { 
  projectName: string; 
  onClose: () => void; 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) {
  const { 
    showCitationsPanel, 
    showPdfReaderPanel, 
    showPdfChatPanel,
    toggleCitationsPanel, 
    togglePdfReaderPanel, 
    togglePdfChatPanel,
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
    setActiveAiTab,
    triggerAiAction
  } = useEditor();

  return (
    <EditorHeader 
      title={projectName}
      showCitationsPanel={showCitationsPanel}
      showPdfReaderPanel={showPdfReaderPanel}
      showPdfChatPanel={showPdfChatPanel}
      toggleCitationsPanel={toggleCitationsPanel}
      togglePdfReaderPanel={togglePdfReaderPanel}
      togglePdfChatPanel={togglePdfChatPanel}
      onClose={onClose}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showLeftSidebar={showLeftSidebar}
      showRightSidebar={showRightSidebar}
      setShowLeftSidebar={toggleLeftSidebar}
      setShowRightSidebar={toggleRightSidebar}
      setActiveAiTab={setActiveAiTab}
      triggerAiAction={triggerAiAction}
    />
  );
}

export function WritingDashboard({ projectName, onClose, template, activeFeature }: WritingDashboardProps) {
  const { activeTab, setActiveTab } = useDashboardTabs(activeFeature);
  const isMobile = useIsMobile();

  return (
    <EditorProvider projectName={projectName} template={template}>
      <div className={`mx-auto animate-fadeIn min-h-screen bg-white dark:bg-gray-950 ${activeTab === 'editor' ? 'max-w-full px-0' : 'max-w-7xl px-4'}`}>
        <ProjectHeader 
          projectName={projectName} 
          onClose={onClose} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {isMobile && (
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Mobile View</AlertTitle>
            <AlertDescription>
              Some features may be optimized for desktop. For the best experience, consider using a larger screen.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <DashboardTabContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              projectName={projectName}
              onClose={onClose}
              template={template}
              activeFeature={activeFeature}
            />
          </Tabs>
        </div>
      </div>
    </EditorProvider>
  );
}
