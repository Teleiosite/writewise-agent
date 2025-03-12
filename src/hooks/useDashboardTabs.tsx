
import { useState, useEffect } from "react";
import type { TemplateType } from "@/components/DocumentTemplates";

export function useDashboardTabs(activeFeature?: string | null) {
  const [activeTab, setActiveTab] = useState("editor");
  
  useEffect(() => {
    // Set the active tab based on the selected feature
    if (activeFeature) {
      switch (activeFeature) {
        case "AI-Powered Editor":
          setActiveTab("editor");
          break;
        case "Citation Manager":
          setActiveTab("editor");
          // We'll handle showing the citation manager in the WritingEditor component
          localStorage.setItem("show-citation-manager", "true");
          break;
        case "Progress Tracking":
          setActiveTab("goals");
          break;
        case "Research Assistant":
          setActiveTab("assistant");
          break;
        case "AI Detector":
          setActiveTab("ai-detector");
          break;
        case "Text Humanizer":
          setActiveTab("humanizer");
          break;
        case "Read PDF":
          setActiveTab("editor");
          localStorage.setItem("show-pdf-reader", "true");
          break;
        default:
          setActiveTab("editor");
      }
    }
  }, [activeFeature]);

  return { activeTab, setActiveTab };
}
