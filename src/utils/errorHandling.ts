
import { toast } from "@/hooks/use-toast";

/**
 * Error handling utility for API calls and async operations
 */
export function handleError(error: unknown, title = "Error", fallbackMessage = "An unexpected error occurred") {
  console.error("Error occurred:", error);
  
  let message = fallbackMessage;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }
  
  toast({
    title,
    description: message,
    variant: "destructive",
  });
  
  return message;
}

/**
 * Wrapper for async functions to handle errors automatically
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorTitle = "Error",
  fallbackMessage = "An unexpected error occurred"
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = handleError(error, errorTitle, fallbackMessage);
    return { data: null, error: errorMessage };
  }
}
