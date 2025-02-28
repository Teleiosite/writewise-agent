
/**
 * Services for text analysis (grammar, structure, semantics)
 */
import { AIResponse } from './ai-types';
import { callChatGptApi } from './api-client';

export async function getGrammarAnalysis(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are a grammar expert. Analyze the text and provide detailed feedback on grammar, punctuation, and sentence structure. Return results as a JSON object with "issues" array and "suggestions" array.';
    const userMessage = `Analyze the grammar in this text: ${text}`;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'Grammar Analysis',
      confidence: 0.9
    };
  } catch (error) {
    console.error('Error in grammar analysis:', error);
    return {
      content: JSON.stringify({
        issues: [],
        suggestions: ['Check for proper punctuation', 'Review sentence structure', 'Verify subject-verb agreement']
      }),
      source: 'Fallback Grammar Check',
      confidence: 0.7
    };
  }
}

export async function getContentStructure(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are a document structure expert. Analyze the text and provide feedback on organization, flow, and logical structure. Return results as a JSON object with "sections" array and "improvements" array.';
    const userMessage = `Analyze the structure of this text: ${text}`;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'Structure Analysis',
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error in content structure analysis:', error);
    return {
      content: JSON.stringify({
        sections: ['Introduction', 'Main Content', 'Conclusion'],
        improvements: ['Consider adding topic sentences', 'Strengthen transitions between paragraphs']
      }),
      source: 'Fallback Structure Analysis',
      confidence: 0.7
    };
  }
}

export async function getSemanticAnalysis(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are a semantic analysis expert. Analyze the text for clarity, coherence, and meaning. Return results as a JSON object with "keywords" array, "topics" array, and "suggestions" array.';
    const userMessage = `Perform semantic analysis on this text: ${text}`;
    
    const data = await callChatGptApi(systemPrompt, userMessage);
    
    return {
      content: data.choices[0].message.content,
      source: 'Semantic Analysis',
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error in semantic analysis:', error);
    return {
      content: JSON.stringify({
        keywords: [],
        topics: [],
        suggestions: ['Review main themes', 'Ensure consistent terminology', 'Check for clear message']
      }),
      source: 'Fallback Semantic Analysis',
      confidence: 0.7
    };
  }
}
