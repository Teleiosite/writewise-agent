import { Section } from './types';

const STORAGE_PREFIX = 'writewise-project-';

/**
 * Saves project sections to localStorage.
 * Returns the timestamp of the save operation.
 */
export function saveProjectToStorage(projectName: string, sections: Section[]): Date {
  const savedTime = new Date();
  const storageKey = `${STORAGE_PREFIX}${projectName}`;

  const data = {
    sections,
    lastSaved: savedTime.toISOString(),
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    // localStorage may be full or unavailable (private browsing, etc.)
    console.error('Failed to save project to localStorage:', error);
    throw error;
  }

  return savedTime;
}

/**
 * Loads project sections from localStorage.
 * Returns null if no saved data exists.
 */
export function loadProjectFromStorage(
  projectName: string
): { sections: Section[]; lastSaved: Date | null } | null {
  const storageKey = `${STORAGE_PREFIX}${projectName}`;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      sections: parsed.sections ?? [],
      lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Removes project data from localStorage.
 */
export function clearProjectFromStorage(projectName: string): void {
  const storageKey = `${STORAGE_PREFIX}${projectName}`;
  localStorage.removeItem(storageKey);
}
