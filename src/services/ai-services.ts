
import { useState } from 'react';

interface AIResponse {
  content: string;
  source: string;
  confidence: number;
}

const MOCK_PAPERS = [
  {
    title: "Recent Advances in Machine Learning: A Comprehensive Review",
    authors: ["Smith, J.", "Johnson, R.", "Williams, M."],
    year: "2023",
    source: "Journal of Artificial Intelligence Research",
    doi: "10.1234/jair.2023.123"
  },
  {
    title: "Deep Learning Applications in Healthcare",
    authors: ["Brown, A.", "Davis, S."],
    year: "2023",
    source: "Medical AI Journal",
    doi: "10.5678/maj.2023.456"
  },
  {
    title: "Natural Language Processing: State of the Art",
    authors: ["Miller, P.", "Wilson, K."],
    year: "2022",
    source: "Computational Linguistics Quarterly",
    doi: "10.9012/clq.2022.789"
  }
];

export async function getWritingSuggestions(text: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert writing assistant. Analyze the text and provide specific, actionable suggestions for improvement. Focus on clarity, structure, and academic style.' },
          { role: 'user', content: `Please analyze this text and provide detailed writing suggestions: ${text}` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
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

export async function getChatbotResponse(text: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful academic paper search assistant. Return results in JSON format with title, authors (array), year, source, and doi fields.' },
          { role: 'user', content: text }
        ],
      }),
    });

    if (!response.ok) {
      console.log('Using mock data as fallback');
      return {
        content: JSON.stringify(MOCK_PAPERS),
        source: 'Mock Data',
        confidence: 1.0
      };
    }

    const data = await response.json();
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

export async function getGrammarAnalysis(text: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are a grammar expert. Analyze the text and provide detailed feedback on grammar, punctuation, and sentence structure. Return results as a JSON object with "issues" array and "suggestions" array.' 
          },
          { role: 'user', content: `Analyze the grammar in this text: ${text}` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Grammar analysis failed');
    }

    const data = await response.json();
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
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are a document structure expert. Analyze the text and provide feedback on organization, flow, and logical structure. Return results as a JSON object with "sections" array and "improvements" array.' 
          },
          { role: 'user', content: `Analyze the structure of this text: ${text}` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Structure analysis failed');
    }

    const data = await response.json();
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
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are a semantic analysis expert. Analyze the text for clarity, coherence, and meaning. Return results as a JSON object with "keywords" array, "topics" array, and "suggestions" array.' 
          },
          { role: 'user', content: `Perform semantic analysis on this text: ${text}` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Semantic analysis failed');
    }

    const data = await response.json();
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

export async function generateSectionContent(title: string, section: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: `You are an expert academic writer. Generate a well-structured ${section} section for an academic paper. Follow academic writing conventions and maintain a formal tone.` 
          },
          { role: 'user', content: `Write a ${section} section for a paper titled: "${title}"` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Text generation failed');
    }

    const data = await response.json();
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
