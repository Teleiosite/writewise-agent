
/**
 * Services for writing assistance and suggestions
 */
import { AIResponse } from './ai-types';
import { callChatGptApi } from './api-client';

export async function getWritingSuggestions(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are an expert writing assistant. Analyze the text and provide specific, actionable suggestions for improvement. Focus on clarity, structure, and academic style.';
    const userMessage = `Please analyze this text and provide detailed writing suggestions: ${text}`;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'ChatGPT Free',
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error in writing suggestions:', error);
    return {
      content: "Here are some general writing suggestions:\n- Use clear and concise language\n- Ensure proper paragraph structure\n- Check for consistent formatting\n- Review citations and references",
      source: 'Fallback Suggestions',
      confidence: 0.7
    };
  }
}
