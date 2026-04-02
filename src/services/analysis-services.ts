
/**
 * Services for text analysis (grammar, structure, semantics)
 */
import { AIResponse } from './ai-types';
import { callChatGptApi } from './api-client';

export async function getGrammarAnalysis(text: string): Promise<AIResponse> {
  try {
    const systemPrompt = 'You are a grammar expert. Analyze the text and provide a concise, bulleted list of the most important issues (punctuation, syntax, spelling). Start each issue on a new line with a bullet point like "- ". Be specific and brief.';
    const userMessage = `Check grammar for: ${text}`;
    
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
    const systemPrompt = 'You are an expert writing assistant. Provide exactly 3 or 4 specific, actionable writing suggestions to improve the text quality. Format these as a bulleted list starting with "- ". Focus on academic clarity and style.';
    const userMessage = `Provide suggestions for: ${text}`;
    
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
