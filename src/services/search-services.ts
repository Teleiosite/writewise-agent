
/**
 * Services for paper search and references
 */
import { AIResponse, MOCK_PAPERS } from './ai-types';
import { callChatGptApi } from './api-client';

export async function getChatbotResponse(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are a helpful academic paper search assistant. Return results in JSON format with title, authors (array), year, source, and doi fields.';
    const userMessage = text;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'ChatGPT Free',
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error in chatbot response:', error);
    return {
      content: JSON.stringify(MOCK_PAPERS),
      source: 'Mock Data',
      confidence: 1.0
    };
  }
}
