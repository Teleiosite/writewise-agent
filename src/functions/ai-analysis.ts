
import type { RequestHandler } from '@sveltejs/kit';

interface AIRequest {
  text: string;
  type: 'suggestions' | 'analysis' | 'grammar';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const POST: RequestHandler = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await request.json() as AIRequest;
    const openAIApiKey = process.env.VITE_OPENAI_API_KEY;

    const prompts = {
      suggestions: "Analyze this text and provide 3-5 specific suggestions for improvement:",
      analysis: "Analyze this text and provide metrics for: readability score, tone, key themes, and potential improvements.",
      grammar: "Check this text for grammar and style issues, providing specific corrections:",
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional writing assistant focused on academic and technical writing.',
          },
          {
            role: 'user',
            content: `${prompts[type]}\n\nText: ${text}`,
          },
        ],
      }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

