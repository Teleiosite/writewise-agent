import { useState, useEffect } from "react";

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
          localStorage.setItem("show-citation-manager", "true");
          break;
        case "Research Assistant":
          setActiveTab("assistant");
          break;
        case "Read PDF":
        case "Read PDF & Chat":
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
