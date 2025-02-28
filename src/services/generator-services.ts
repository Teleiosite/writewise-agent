
/**
 * Services for content generation
 */
import { AIResponse } from './ai-types';
import { callChatGptApi } from './api-client';

export async function generateSectionContent(title: string, section: string): Promise<AIResponse> {
  try {
    const systemPrompt = `You are an expert academic writer. Generate a well-structured ${section} section for an academic paper. Follow academic writing conventions and maintain a formal tone.`;
    const userMessage = `Write a ${section} section for a paper titled: "${title}"`;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'AI Text Generator',
      confidence: 0.9
    };
  } catch (error) {
    console.error('Error in text generation:', error);
    return {
      content: `Sample ${section} content. Please try again later.`,
      source: 'Fallback Generator',
      confidence: 0.5
    };
  }
}
