
import { Section } from './types';

export const calculateWordCount = (content: string): number => {
  // Strip HTML tags for accurate word count
  const plainText = content.replace(/<[^>]*>/g, ' ');
  return plainText.trim().split(/\s+/).filter(Boolean).length;
};

export const calculateReadingTime = (wordCount: number): number => {
  return Math.ceil(wordCount / 200);
};

export const createSectionFromTitle = (title: string): Section => {
  return {
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    content: "",
    order: 0 // Adding the required order property
  };
};

export const getSectionById = (sections: Section[], id: string): Section | undefined => {
  return sections.find(s => s.id === id);
};

export const getDefaultSections = (): Section[] => {
  return [{ id: "main-content", title: "Main Content", content: "", order: 0 }]; // Adding the required order property
};
