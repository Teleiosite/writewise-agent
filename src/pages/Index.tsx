import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { WritingDashboard } from "@/components/WritingDashboard";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectContext";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { type TemplateType } from "@/components/DocumentTemplates";
import { OnboardingWizard } from "@/components/OnboardingWizard";

function IndexContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>(undefined);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const { activeProject, setActiveProject } = useProjects();

  useEffect(() => {
    const storedTemplate = localStorage.getItem("selected-template");
    if (storedTemplate) {
      setSelectedTemplate(JSON.parse(storedTemplate));
    }
    
    const storedFeature = localStorage.getItem("active-feature");
    if (storedFeature) {
      setActiveFeature(storedFeature);
    }
  }, []);

  const handleCloseDashboard = () => {
    setActiveProject(null);
    setActiveFeature(null);
    localStorage.removeItem("selected-template");
    localStorage.removeItem("active-feature");
  };

  if (activeProject) {
    return (
      <WritingDashboard 
        projectName={activeProject}
        onClose={handleCloseDashboard}
        template={selectedTemplate}
        activeFeature={activeFeature}
      />
    );
  }

  return (
    <HomeLayout>
      <OnboardingWizard />
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-none border-black dark:border-zinc-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <Dashboard />
    </HomeLayout>
  );
}

export default function Index() {
  return (
    <ProjectProvider>
      <IndexContent />
    </ProjectProvider>
  );
}
