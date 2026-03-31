
import { handleError } from "@/utils/errorHandling";

export interface NormalizedAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Calls Pollinations.ai — a free, no-auth, CORS-friendly AI API.
 * Falls back gracefully if the request fails.
 */
async function callPollinationsApi(
  messages: Array<{ role: string; content: string }>
): Promise<NormalizedAIResponse> {
  const response = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: "openai",
      private: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pollinations API error: ${response.status}`);
  }

  const text = await response.text();
  return { choices: [{ message: { content: text.trim() } }] };
}

/**
 * Calls the user's configured API provider via our Vercel Serverless proxy (/api/chat).
 * This elegantly bypasses browser CORS restrictions for Custom API keys while safely
 * preserving the keys themselves. 
 */
async function callUserConfiguredApi(
  provider: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<NormalizedAIResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey, messages })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Proxy error: ${response.status}`);
  }

  const data = await response.json();

  if (provider === 'Gemini') {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return { choices: [{ message: { content } }] };
  }

  return data as NormalizedAIResponse;
}

/**
 * Main AI API client.
 * Priority:
 *  1. User's configured API key/provider (from Settings page → localStorage)
 *  2. Pollinations.ai free fallback (no auth required, CORS-friendly)
 */
export async function callChatGptApi(
  systemPrompt: string,
  userMessage: string
): Promise<NormalizedAIResponse> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const apiProvider = localStorage.getItem("apiProvider");
  const apiKey = localStorage.getItem("apiKey");

  try {
    if (apiProvider && apiKey) {
      return await callUserConfiguredApi(apiProvider, apiKey, messages);
    }
    return await callPollinationsApi(messages);
  } catch (error) {
    handleError(error, "API Error", "Failed to communicate with the AI service");
    throw error;
  }
}

export async function withLoadingFeedback<T>(
  promise: () => Promise<T>,
  _loadingMessage = "Processing your request...",
  _successMessage = "Operation completed successfully"
): Promise<T> {
  try {
    return await promise();
  } catch (error) {
    throw error;
  }
}
