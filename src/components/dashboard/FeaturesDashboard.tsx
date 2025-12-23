
import React, { useState } from "react";
import { FeaturesSidebar } from "./FeaturesSidebar";
import { useProjects } from "@/contexts/ProjectContext";

export function FeaturesDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { handleFeatureClick } = useProjects();

  return (
    <FeaturesSidebar
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      onFeatureClick={handleFeatureClick}
    />
  );
}
