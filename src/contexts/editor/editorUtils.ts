
import { Section } from './types';

export const calculateWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

export const calculateReadingTime = (wordCount: number): number => {
  return Math.ceil(wordCount / 200);
};

export const createSectionFromTitle = (title: string): Section => {
  return {
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    content: ""
  };
};

export const getSectionById = (sections: Section[], id: string): Section | undefined => {
  return sections.find(s => s.id === id);
};

export const getDefaultSections = (): Section[] => {
  return [{ id: "main-content", title: "Main Content", content: "" }];
};
