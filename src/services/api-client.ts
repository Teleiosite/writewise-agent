
import { handleError } from "@/utils/errorHandling";

export interface NormalizedAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

type Msg = { role: string; content: string };

// ─── Gemini Direct Browser Call ─────────────────────────────────────────────
async function callGeminiDirect(
  apiKey: string,
  model: string,
  messages: Msg[],
  version: "v1" | "v1beta" = "v1"
): Promise<NormalizedAIResponse> {
  const m = model.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${apiKey.trim()}`;

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
    const rawError = err.error?.message || `HTTP ${res.status}`;

    // If v1 fails with 404 (model not found), try v1beta automatically
    // (since gemini-2.0-flash is often preview-only in some regions)
    if (res.status === 404 && version === "v1" && m.includes("2.0")) {
      console.warn("Gemini v1 failed (404), falling back to v1beta...");
      return await callGeminiDirect(apiKey, model, messages, "v1beta");
    }

    throw new Error(`Gemini API: ${rawError}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return { choices: [{ message: { content } }] };
}

// ─── Proxy Call (OpenAI, Claude, etc) ────────────────────────────────────────
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

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Proxy returned unexpected response (not JSON)");
  }

  return (await response.json()) as NormalizedAIResponse;
}

// ─── Pollinations (Free Fallback) ────────────────────────────────────────────
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

// ─── DIAGNOSTICS: Test simple connection ─────────────────────────────────────
export async function testAiConnection(
  provider: string,
  apiKey: string,
  model: string
): Promise<{ success: boolean; message: string }> {
  const testMessage: Msg[] = [{ role: "user", content: "Hello" }];
  
  try {
    if (provider === "Gemini") {
      await callGeminiDirect(apiKey, model, testMessage);
    } else {
      await callViaProxy(provider, apiKey, model, testMessage);
    }
    return { success: true, message: "Connection successful! Your AI key is working." };
  } catch (error: any) {
    console.error("Test connection failed:", error);
    return { 
      success: false, 
      message: error.message || "Unknown error during test connection." 
    };
  }
}

// ─── Main API Client Entry Point ─────────────────────────────────────────────
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
      if (apiProvider === "Gemini") {
        return await callGeminiDirect(apiKey, apiModel ?? "gemini-2.0-flash", messages);
      }
      return await callViaProxy(apiProvider, apiKey, apiModel, messages);
    }

    return await callPollinationsApi(messages);
  } catch (error) {
    handleError(error, "AI Request Error", "Failed to communicate with the AI service");
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
