
/**
 * Main export file for AI services
 * This file re-exports all the services from the individual modules
 */

// Export all types
export type { AIResponse } from './ai-types';
export { MOCK_PAPERS } from './ai-types';

// Export all service functions
export { getWritingSuggestions } from './writing-services';
export { getGrammarAnalysis, getContentStructure, getSemanticAnalysis } from './analysis-services';
export { generateSectionContent } from './generator-services';
export { getChatbotResponse } from './search-services';
