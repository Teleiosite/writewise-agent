import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { DashboardTabContent } from "@/components/dashboard/DashboardTabContent";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import type { TemplateType } from "./DocumentTemplates";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { EditorProvider, useEditor } from "@/contexts/editor";
import { EditorHeader } from "./editor/EditorHeader";
import { EditorToolbar } from "./editor/EditorToolbar";
import { LiteratureMatrixModal } from "./matrix/LiteratureMatrixModal";
import { DefenseDeckModal } from "./defense/DefenseDeckModal";
import { AcademicToneAuditorModal } from "./editor/AcademicToneAuditorModal";
import { SupervisorEmailModal } from "./verification/SupervisorEmailModal";

interface WritingDashboardProps {
  projectName: string;
  onClose: () => void;
  template?: TemplateType;
  activeFeature?: string | null;
}

// Internal component to use the Editor Context for the header and tools
function DashboardWithModals({ 
  projectName, 
  onClose, 
  template, 
  activeFeature 
}: WritingDashboardProps) {
  const { activeTab, setActiveTab } = useDashboardTabs(activeFeature);
  const isMobile = useIsMobile();

  const { 
    showCitationsPanel, 
    showPdfReaderPanel, 
    showPdfChatPanel,
    showAnalysisPanel,
    analysisTab,
    toggleCitationsPanel, 
    togglePdfReaderPanel, 
    togglePdfChatPanel,
    toggleAnalysisPanel,
    addContentToActiveSection,
    getCurrentSectionContent,
    updateSectionContent,
    insertCitation
  } = useEditor();

  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showDefenseDeckModal, setShowDefenseDeckModal] = useState(false);
  const [showToneAuditorModal, setShowToneAuditorModal] = useState(false);
  const [showSupervisorEmailModal, setShowSupervisorEmailModal] = useState(false);

  return (
    <div className={`mx-auto animate-fadeIn min-h-screen bg-white dark:bg-gray-950 ${(activeTab === 'editor' || activeTab === 'data-analysis') ? 'max-w-full px-0' : 'max-w-7xl px-4'}`}>
      
      {/* Pinned Top Workspace Header + Editor Ribbon */}
      <div className="sticky top-0 z-40 bg-white dark:bg-black shadow-sm">
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
          showAnalysisPanel={showAnalysisPanel}
          analysisTab={analysisTab}
          toggleAnalysisPanel={toggleAnalysisPanel}
          onOpenLiteratureMatrix={() => setShowMatrixModal(true)}
          onOpenDefenseDeck={() => setShowDefenseDeckModal(true)}
          onOpenAcademicToneAuditor={() => setShowToneAuditorModal(true)}
          onOpenSupervisorEmail={() => setShowSupervisorEmailModal(true)}
        />

        {/* The entire ribbon appears when on the Editor tab, disappears on other tabs */}
        {activeTab === 'editor' && (
          <div className="animate-in fade-in-50 duration-200">
            <EditorToolbar />
          </div>
        )}
      </div>

      {isMobile && (
        <Alert className="my-4 mx-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Mobile View</AlertTitle>
          <AlertDescription>
            Some features may be optimized for desktop. For the best experience, consider using a larger screen.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <DashboardTabContent 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projectName={projectName}
          onClose={onClose}
          template={template}
          activeFeature={activeFeature}
        />
      </Tabs>

      {/* Feature 1: Automated Empirical Literature Matrix (Chapter 2) */}
      <LiteratureMatrixModal
        isOpen={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        defaultTopic={projectName}
        onInsertToChapter={(content) => addContentToActiveSection(content)}
        onAddCitationsToLibrary={(citations) => {
          citations.forEach(c => insertCitation(c.title));
        }}
      />

      {/* Feature 2: Thesis Defense Slide Deck Generator (.pptx) */}
      <DefenseDeckModal
        isOpen={showDefenseDeckModal}
        onClose={() => setShowDefenseDeckModal(false)}
        projectName={projectName}
      />

      {/* Feature 3: Pre-Submission Academic Tone & Turnitin Rigor Auditor */}
      <AcademicToneAuditorModal
        isOpen={showToneAuditorModal}
        onClose={() => setShowToneAuditorModal(false)}
        currentText={getCurrentSectionContent()}
        onApplyEnhancedText={(newText) => updateSectionContent(newText)}
      />

      {/* Feature 5: Email Verification Package to Supervisor */}
      <SupervisorEmailModal
        isOpen={showSupervisorEmailModal}
        onClose={() => setShowSupervisorEmailModal(false)}
        projectName={projectName}
      />
    </div>
  );
}

export function WritingDashboard(props: WritingDashboardProps) {
  return (
    <EditorProvider projectName={props.projectName} template={props.template}>
      <DashboardWithModals {...props} />
    </EditorProvider>
  );
}
