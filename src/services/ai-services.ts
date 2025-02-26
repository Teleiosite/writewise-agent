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
          { role: 'system', content: 'You are a helpful writing assistant.' },
          { role: 'user', content: `Analyze this text and provide writing suggestions: ${text}` }
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
    throw error;
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
          { role: 'system', content: 'You are a helpful academic paper search assistant.' },
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
  // IBM Watson for grammar analysis
  const response = await fetch(`https://api.us-south.language-translator.watson.cloud.ibm.com/instances/your-instance/v3/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_WATSON_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      features: {
        syntax: true,
        categories: true,
      },
    }),
  });

  const data = await response.json();
  return {
    content: JSON.stringify(data.syntax),
    source: 'IBM Watson',
    confidence: 0.9,
  };
}

export async function getContentStructure(text: string): Promise<AIResponse> {
  // Google Bard for content structure analysis
  const response = await fetch('https://api.bard.google.com/v1/text:analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_BARD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      features: ['EXTRACT_STRUCTURE'],
    }),
  });

  const data = await response.json();
  return {
    content: JSON.stringify(data.structure),
    source: 'Google Bard',
    confidence: 0.85,
  };
}

export async function getSemanticAnalysis(text: string): Promise<AIResponse> {
  // Wit.ai for semantic analysis
  const response = await fetch('https://api.wit.ai/message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_WIT_AI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
    }),
  });

  const data = await response.json();
  return {
    content: JSON.stringify(data.entities),
    source: 'Wit.ai',
    confidence: 0.8,
  };
}
