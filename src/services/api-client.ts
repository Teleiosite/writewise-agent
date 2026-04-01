
import { handleError } from "@/utils/errorHandling";

export interface NormalizedAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

type Msg = { role: string; content: string };

// ─── Gemini — called directly from the browser ───────────────────────────────
// Google's Generative Language API sends proper CORS headers, so we can hit it
// straight from the client without routing through the Vercel proxy.
async function callGeminiDirect(
  apiKey: string,
  model: string,
  messages: Msg[]
): Promise<NormalizedAIResponse> {
  const m = model.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;

  const systemMsg = messages.find((msg) => msg.role === "system")?.content;
  const chatMessages = messages.filter((msg) => msg.role !== "system");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(systemMsg && { systemInstruction: { parts: [{ text: systemMsg }] } }),
      contents: chatMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const content =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return { choices: [{ message: { content } }] };
}

// ─── Proxy — for providers that don't support browser CORS ───────────────────
// (OpenAI, DeepSeek, Grok, Claude all require Authorization headers which
//  browsers won't send cross-origin — so we relay via /api/chat on Vercel)
async function callViaProxy(
  provider: string,
  apiKey: string,
  model: string | null,
  messages: Msg[]
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
    throw new Error(err.error || `Proxy error ${response.status}`);
  }

  // Check that we got JSON and not an HTML page (which would mean the proxy
  // route wasn't matched and the rewrite returned index.html instead)
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The AI proxy returned an unexpected response. Please check your Vercel deployment."
    );
  }

  return (await response.json()) as NormalizedAIResponse;
}

// ─── Pollinations fallback ────────────────────────────────────────────────────
async function callPollinationsApi(messages: Msg[]): Promise<NormalizedAIResponse> {
  const response = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai", private: true }),
  });

  if (!response.ok) {
    throw new Error(`Pollinations API error: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) throw new Error("Pollinations returned an empty response.");
  return { choices: [{ message: { content: text.trim() } }] };
}

// ─── Main entry point ─────────────────────────────────────────────────────────
export async function callChatGptApi(
  systemPrompt: string,
  userMessage: string
): Promise<NormalizedAIResponse> {
  const messages: Msg[] = [
    { role: "system", content: systemPrompt },
    { role: "user",   content: userMessage  },
  ];

  const apiProvider = localStorage.getItem("apiProvider")?.trim() ?? "";
  const apiKey      = localStorage.getItem("apiKey")?.trim()      ?? "";
  const apiModel    = localStorage.getItem("apiModel")?.trim()    ?? null;

  try {
    if (apiProvider && apiKey) {
      // Gemini: direct browser call (CORS supported, no proxy needed)
      if (apiProvider === "Gemini") {
        return await callGeminiDirect(apiKey, apiModel ?? "gemini-2.0-flash", messages);
      }
      // All others: Vercel serverless proxy
      return await callViaProxy(apiProvider, apiKey, apiModel, messages);
    }

    // No key configured — free fallback
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
