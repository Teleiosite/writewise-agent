import { useState } from 'react';

interface AIResponse {
  content: string;
  source: string;
  confidence: number;
}

// Declare the Puter global type
declare global {
  interface Window {
    puter: any;
  }
}

export async function getWritingSuggestions(text: string): Promise<AIResponse> {
  try {
    const response = await window.puter.ai.complete({
      prompt: `Analyze this text and provide writing suggestions: ${text}`,
      model: 'gpt-4o',
      max_tokens: 500
    });

    return {
      content: response.choices[0].text,
      source: 'GPT-4o',
      confidence: 0.95
    };
  } catch (error) {
    console.error('Error in writing suggestions:', error);
    // Fallback to Free-GPT4-WEB-API if Puter.js fails
    const response = await fetch('https://free-gpt4-web-api.puter.com/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model: 'gpt-4o',
        task: 'writing_suggestions'
      }),
    });

    const data = await response.json();
    return {
      content: data.analysis,
      source: 'Free-GPT4',
      confidence: 0.9
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

export async function getChatbotResponse(text: string): Promise<AIResponse> {
  try {
    const response = await window.puter.ai.chat({
      messages: [
        { role: 'system', content: 'You are a helpful writing assistant.' },
        { role: 'user', content: text }
      ],
      model: 'gpt-4o'
    });

    return {
      content: response.choices[0].message.content,
      source: 'Puter.js GPT-4o',
      confidence: 0.9
    };
  } catch (error) {
    console.error('Error in chatbot response:', error);
    // Fallback to Free-GPT4-WEB-API if Puter.js fails
    const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful writing assistant.' },
          { role: 'user', content: text }
        ],
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      source: 'ChatGPT Free',
      confidence: 0.85
    };
  }
}
