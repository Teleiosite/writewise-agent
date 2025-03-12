
import React, { useState } from "react";
import { FeaturesSidebar } from "./FeaturesSidebar";
import { documentTemplates } from "@/components/DocumentTemplates";
import { useProjects } from "@/contexts/ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { type Project } from "./ProjectCard";

export function FeaturesDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const { projects, saveProjects, setActiveProject } = useProjects();
  const { toast } = useToast();

  const handleFeatureClick = (feature: string) => {
    const featureDemoName = `${feature} Demo`;
    
    let templateToUse;
    switch (feature) {
      case "AI-Powered Editor":
        templateToUse = documentTemplates[0];
        break;
      case "Citation Manager":
        templateToUse = documentTemplates[1];
        break;
      case "Progress Tracking":
        templateToUse = documentTemplates[0];
        break;
      case "Research Assistant":
        templateToUse = documentTemplates[2];
        break;
      case "AI Detector":
        templateToUse = documentTemplates[0];
        break;
      case "Text Humanizer":
        templateToUse = documentTemplates[0];
        break;
      case "Read PDF":
        templateToUse = documentTemplates[0];
        break;
      default:
        templateToUse = documentTemplates[0];
    }
    
    // Store the template in localStorage for the WritingDashboard to use
    localStorage.setItem("selected-template", JSON.stringify(templateToUse));
    localStorage.setItem("active-feature", feature);
    
    if (!projects.some(p => p.name === featureDemoName)) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: featureDemoName,
        description: `A demo project for the ${feature} feature`,
        lastEdited: new Date(),
        wordCount: 0,
        collaborators: 0
      };
      
      const updatedProjects = [...projects, newProject];
      saveProjects(updatedProjects);
      
      toast({
        title: "Demo project created",
        description: `"${featureDemoName}" has been created to showcase the ${feature} feature.`,
      });
    }
    
    setActiveProject(featureDemoName);
    setActiveFeature(feature);
    
    setMobileMenuOpen(false);
  };

  return (
    <FeaturesSidebar
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      onFeatureClick={handleFeatureClick}
    />
  );
}
