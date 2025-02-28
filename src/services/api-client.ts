
/**
 * Common API client for making requests to ChatGPT API
 */
export async function callChatGptApi(systemPrompt: string, userMessage: string) {
  const response = await fetch('https://chatgpt-api-free.puter.com/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
    }),
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return await response.json();
}
