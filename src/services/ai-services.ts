
// Define the type for chat response
export interface ChatResponse {
  content: string;
}

// Define a common interface for AI analysis responses
export interface AIResponse {
  content: string;
  source?: string;
  confidence?: number;
}

// Mock function to simulate AI chatbot response
// Real function to get AI chatbot response
export const getChatbotResponse = async (message: string): Promise<ChatResponse> => {
  try {
    const { callChatGptApi } = await import("@/services/api-client");

    const data = await callChatGptApi(
      `You are the WriteWise AI Assistant, a helpful expert in academic writing.
       Help the user with questions about structure, grammar, citations, and general writing advice.
       Keep responses helpful, scholarly, yet supportive.`,
      message
    );

    const content = data.choices?.[0]?.message?.content?.trim() ?? 
      "I'm sorry, I couldn't generate a response right now. Please try again.";

    return { content };
  } catch (error) {
    console.error("AI Communication Error:", error);
    return {
      content: "Sorry, I encountered an issue while communicating with the AI service. Please check your connection or try again later.",
    };
  }
};

// ... (rest of the file remains the same)


// Function to get writing suggestions
export const getWritingSuggestions = async (text: string): Promise<AIResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo, return a mock suggestion
  return {
    content: "Consider using more specific examples to strengthen your argument. Your writing could benefit from more transition phrases between paragraphs to improve flow.",
    source: "Writing Assistant AI",
    confidence: 0.85
  };
};

// Function to get grammar analysis
export const getGrammarAnalysis = async (text: string): Promise<AIResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // For demo, return a mock grammar analysis
  return {
    content: "There are a few grammatical issues in your text, including some subject-verb agreement errors and inconsistent tense usage. Consider revising for clarity.",
    source: "Grammar Analysis",
    confidence: 0.9
  };
};

// Function to get content structure analysis
export const getContentStructure = async (text: string): Promise<AIResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // For demo, return a mock content structure analysis
  return {
    content: JSON.stringify({
      sections: ["Introduction", "Main Content", "Conclusion"],
      suggestions: ["Add clearer topic sentences", "Strengthen the conclusion"]
    }),
    source: "Structure Analysis",
    confidence: 0.8
  };
};

// Function to get semantic analysis
export const getSemanticAnalysis = async (text: string): Promise<AIResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 900));
  
  // For demo, return a mock semantic analysis
  return {
    content: JSON.stringify({
      keywords: ["research", "analysis", "methodology"],
      clarity: "moderate",
      suggestions: ["Clarify key concepts", "Use more precise terminology"]
    }),
    source: "Semantic Analysis",
    confidence: 0.75
  };
};

// Function to generate section content using real AI
export const generateSectionContent = async (projectTitle: string, section: string): Promise<AIResponse> => {
  try {
    const { callChatGptApi } = await import("@/services/api-client");

    const data = await callChatGptApi(
      `You are an expert academic writer. Generate a well-structured, comprehensive "${section}" section for an academic paper. Follow these rules:
- Use formal scholarly tone and academic writing conventions
- Include appropriate depth and detail for this specific section type
- Use proper paragraph structure with clear transitions
- Do NOT use placeholder text or generic filler
- Return ONLY the section content, no headings or meta-commentary`,
      `Write the "${section}" section for an academic paper titled: "${projectTitle}". Make it genuinely useful and academically rigorous.`
    );

    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      content,
      source: "AI Content Generator",
      confidence: 0.85,
    };
  } catch (error) {
    console.error("Error generating section content:", error);
    return {
      content: `Unable to generate content for the ${section} section right now. Please try again or write this section manually.`,
      source: "Fallback Generator",
      confidence: 0.3,
    };
  }
};

