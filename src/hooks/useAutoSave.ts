
import { useEffect, useState, useCallback } from "react";
import { Section } from "@/contexts/editor/types";
import { saveProjectToStorage } from "@/contexts/editor/editorStorage";
import { toast } from "@/hooks/use-toast";

export function useAutoSave(projectName: string, sections: Section[], lastModified?: Date | null) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveInterval, setSaveInterval] = useState(30000); // 30 seconds default
  
  const saveProject = useCallback(() => {
    if (!sections.length) return;
    
    setIsAutoSaving(true);
    try {
      const savedTime = saveProjectToStorage(projectName, sections);
      setLastSaved(savedTime);
      console.log(`Project ${projectName} auto-saved at ${savedTime.toLocaleTimeString()}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast({
        title: "Auto-save failed",
        description: "Your changes couldn't be saved automatically. Please save manually.",
        variant: "destructive",
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, [projectName, sections]);

  // Initial save on mount
  useEffect(() => {
    if (sections.length && !lastSaved && !lastModified) {
      saveProject();
    } else if (lastModified) {
      setLastSaved(lastModified);
    }
  }, []);

  // Set up auto-save interval
  useEffect(() => {
    const interval = setInterval(saveProject, saveInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [saveProject, saveInterval]);

  // Save when window is closed or blurred
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProject();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProject();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveProject]);

  // Function to manually save
  const manualSave = () => {
    saveProject();
    toast({
      title: "Changes saved",
      description: "Your document has been saved successfully.",
    });
  };

  // Adjust save frequency based on user activity
  const adjustSaveFrequency = (isActive: boolean) => {
    setSaveInterval(isActive ? 10000 : 30000); // 10 seconds when active, 30 seconds when inactive
  };

  return {
    lastSaved,
    isAutoSaving,
    manualSave,
    adjustSaveFrequency
  };
}
