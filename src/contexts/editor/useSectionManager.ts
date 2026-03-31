
import { useState, useEffect } from "react";
import { Section } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { calculateWordCount, calculateReadingTime } from './editorUtils';

export function useSectionManager(projectId: string | undefined) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const fetchSections = async () => {
    if (!projectId) return;
    const { data: fetchedSections, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
    } else {
      setSections(fetchedSections);
      if (fetchedSections.length > 0) {
        setActiveSection(fetchedSections[0].id);
      }
    }
  };

  useEffect(() => {
    setSections([]);
    setActiveSection("");
    fetchSections();
  }, [projectId]);

  useEffect(() => {
    if (!activeSection) return;
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      const words = calculateWordCount(section.content ?? "");
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
      const updatedSections = sections.map(s =>
        s.id === activeSection ? { ...s, content } : s
      );
      setSections(updatedSections);

      // Sync total word_count and last_edited back to the parent project row
      if (projectId) {
        const totalWords = updatedSections.reduce(
          (sum, s) => sum + calculateWordCount(s.content ?? ""),
          0
        );
        await supabase
          .from('projects')
          .update({
            word_count: totalWords,
            last_edited: new Date().toISOString(),
          })
          .eq('id', projectId);
      }
    }
  };

  const getCurrentSectionContent = (): string => {
    const section = sections.find(s => s.id === activeSection);
    return section ? (section.content ?? "") : "";
  };

  const getCurrentSectionTitle = (): string => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.title : "";
  };

  const createSection = async (title: string) => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('sections')
      .insert([{ title, project_id: projectId, order: sections.length, content: "" }])
      .select();

    if (error) {
      console.error('Error creating section:', error);
    } else if (data) {
      const newSection = data[0];
      setSections(prev => [...prev, newSection]);
      setActiveSection(newSection.id);
    }
  };

  const addContentToActiveSection = (content: string) => {
    if (!activeSection) return;
    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = (currentSection.content ?? "") + "\n\n" + content;
      updateSectionContent(newContent);
    }
  };

  const insertCitation = (citation: string) => {
    if (!activeSection) return;
    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const newContent = (currentSection.content ?? "") + "\n" + citation;
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
    insertCitation,
  };
}
