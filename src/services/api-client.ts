
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
 * Used as a fallback when the user hasn't configured a provider/key.
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
 * Calls the user's configured provider via the Vercel serverless proxy /api/chat.
 * The proxy handles CORS and forwards the key server-side so it never leaks in the browser.
 * All provider responses are normalised to the OpenAI choices[] shape.
 */
async function callUserConfiguredApi(
  provider: string,
  apiKey: string,
  model: string | null,
  messages: Array<{ role: string; content: string }>
): Promise<NormalizedAIResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      apiKey,
      messages,
      ...(model ? { model } : {}),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Proxy error: ${response.status}`);
  }

  // All providers now return normalised choices[] from the proxy
  return (await response.json()) as NormalizedAIResponse;
}

/**
 * Main AI entry point used by every AI feature in the app.
 *
 * Priority:
 *  1. User's saved provider + model + API key  → Vercel proxy
 *  2. No key configured                        → free Pollinations.ai fallback
 */
export async function callChatGptApi(
  systemPrompt: string,
  userMessage: string
): Promise<NormalizedAIResponse> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user",   content: userMessage  },
  ];

  const apiProvider = localStorage.getItem("apiProvider");
  const apiKey      = localStorage.getItem("apiKey");
  const apiModel    = localStorage.getItem("apiModel"); // may be null

  try {
    if (apiProvider && apiKey) {
      return await callUserConfiguredApi(apiProvider, apiKey, apiModel, messages);
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
