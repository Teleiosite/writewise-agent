
import { useState, useEffect } from "react";
import { Section } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/contexts/ProjectContext";
import { calculateWordCount, calculateReadingTime } from './editorUtils';

export function useSectionManager(projectName: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const { projects, activeProject } = useProjects();

  const project = projects.find(p => p.name === activeProject);
  const projectId = project?.id;

  const fetchSections = async () => {
    if (!projectId) return;
    const { data: sections, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
    } else {
      setSections(sections);
      if (sections.length > 0) {
        setActiveSection(sections[0].id);
      }
    }
  };

  useEffect(() => {
    fetchSections();
  }, [projectId]);

  useEffect(() => {
    if (!activeSection) return;

    const section = sections.find(s => s.id === activeSection);
    if (section) {
      const words = calculateWordCount(section.content);
      setWordCount(words);
      setReadingTime(calculateReadingTime(words));
    }
  }, [activeSection, sections]);

  const updateSectionContent = async (content: string) => {
    if (!activeSection) return;

    const { error } = await supabase
      .from('sections')
      .update({ content })
      .eq('id', activeSection);

    if (error) {
      console.error('Error updating section:', error);
    } else {
        setSections(sections.map(section =>
            section.id === activeSection ? { ...section, content } : section
        ));
    }
  };

  const getCurrentSectionContent = (): string => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.content : "";
  };

  const getCurrentSectionTitle = (): string => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.title : "";
  };

  const createSection = async (title: string) => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('sections')
      .insert([{ title, project_id: projectId, order: sections.length }])
      .select();

    if (error) {
      console.error('Error creating section:', error);
    } else if (data) {
      const newSection = data[0];
      setSections([...sections, newSection]);
      setActiveSection(newSection.id);
    }
  };

  const addContentToActiveSection = (content: string) => {
    if (!activeSection) return;

    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n\n" + content;
      updateSectionContent(newContent);
    }
  };

  const insertCitation = (citation: string) => {
    if (!activeSection) return;

    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = currentSection.content + "\n" + citation;
      updateSectionContent(newContent);
    }
  };

  return {
    sections,
    setSections,
    activeSection,
    setActiveSection,
    wordCount,
    readingTime,
    fetchSections,
    updateSectionContent,
    getCurrentSectionContent,
    getCurrentSectionTitle,
    createSection,
    addContentToActiveSection,
    insertCitation
  };
}
