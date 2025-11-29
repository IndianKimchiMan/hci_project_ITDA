import { StoredAnalysis } from '../types';

const STORAGE_KEY = 'it-da-analyses';

/**
 * Retrieves all stored analyses from localStorage.
 * @returns {StoredAnalysis[]} An array of stored analyses.
 */
export const getAllAnalyses = (): StoredAnalysis[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve analyses from localStorage:", error);
    return [];
  }
};

/**
 * Saves a new analysis to localStorage.
 * It retrieves the existing list, adds the new one, and saves it back.
 * @param {StoredAnalysis} newAnalysis - The new analysis object to save.
 */
export const saveAnalysis = (newAnalysis: StoredAnalysis): void => {
  try {
    const existingAnalyses = getAllAnalyses();
    const updatedAnalyses = [...existingAnalyses, newAnalysis];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
  } catch (error) {
    console.error("Failed to save analysis to localStorage:", error);
  }
};
