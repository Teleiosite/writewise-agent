
// Define the type for chat response
export interface ChatResponse {
  content: string;
}

// Define a common interface for AI analysis responses
export interface AIResponse {
  content: string;
  source?: string;
  confidence?: number;
}

// AI chatbot response — routes through unified callChatGptApi (uses user API key or free Pollinations fallback)
export const getChatbotResponse = async (message: string): Promise<ChatResponse> => {
  const { callChatGptApi } = await import("@/services/api-client");

  const data = await callChatGptApi(
    `You are a helpful academic writing assistant. Help the user with their writing projects — provide advice on structure, grammar, citations, research, and content. Be concise, specific, and encouraging. Use clear academic language suitable for university-level writing.`,
    message
  );

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { content: "Sorry, I received an empty response. Please try again." };
  }

  return { content };
};

export { getWritingSuggestions } from './writing-services';
export { 
  getGrammarAnalysis, 
  getContentStructure, 
  getSemanticAnalysis 
} from './analysis-services';
export { generateSectionContent } from './generator-services';

