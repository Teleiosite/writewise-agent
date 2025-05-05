
/**
 * Common API client for making requests to ChatGPT API
 */
import { handleError } from "@/utils/errorHandling";
import { toast } from "@/hooks/use-toast";

export async function callChatGptApi(systemPrompt: string, userMessage: string) {
  try {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error, "API Error", "Failed to communicate with the AI service");
    throw error; // Re-throw to allow callers to handle as needed
  }
}

export async function withLoadingFeedback<T>(
  promise: () => Promise<T>,
  loadingMessage = "Processing your request...",
  successMessage = "Operation completed successfully"
): Promise<T> {
  const toastId = toast({
    title: "Loading",
    description: loadingMessage,
  });
  
  try {
    const result = await promise();
    toast({
      title: "Success",
      description: successMessage,
    });
    return result;
  } catch (error) {
    // Error already handled by the API function
    throw error;
  } finally {
    // Clear the loading toast
    toast({
      // Remove the id property as it's not part of the Toast type
      title: "", // Using empty title to remove the toast
      description: "",
    });
  }
}
