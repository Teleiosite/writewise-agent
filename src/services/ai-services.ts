
// Define the type for chat response
export interface ChatResponse {
  content: string;
}

// Mock function to simulate AI chatbot response
export const getChatbotResponse = async (message: string): Promise<ChatResponse> => {
  // In a real app, this would call an AI service API
  // For demo purposes, we're simulating a response
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple response mapping based on keywords
  let response = "";
  
  if (message.toLowerCase().includes("help") || message.toLowerCase().includes("how to")) {
    response = "I can help you with your writing! What specific aspect would you like assistance with? I can provide feedback on structure, grammar, content, or research suggestions.";
  } 
  else if (message.toLowerCase().includes("thesis") || message.toLowerCase().includes("argument")) {
    response = "A strong thesis statement is clear, specific, and arguable. Try to make your main argument focused on a specific aspect rather than being too broad. Would you like me to review your thesis statement?";
  }
  else if (message.toLowerCase().includes("citation") || message.toLowerCase().includes("reference")) {
    response = "For academic writing, it's important to follow the citation style required by your institution (APA, MLA, Chicago, etc.). Make sure to cite all sources properly to avoid plagiarism. Would you like information about a specific citation style?";
  }
  else if (message.toLowerCase().includes("structure") || message.toLowerCase().includes("organize")) {
    response = "A well-structured academic paper typically includes an introduction with a thesis statement, body paragraphs that each focus on a single idea, and a conclusion that synthesizes your arguments. Consider creating an outline before writing to organize your thoughts.";
  }
  else if (message.toLowerCase().includes("research") || message.toLowerCase().includes("sources")) {
    response = "When conducting research, focus on peer-reviewed journals, academic books, and reputable sources. University libraries and academic databases like JSTOR, Google Scholar, or PubMed are excellent places to start your research.";
  }
  else {
    response = "I understand you're asking about \"" + message + "\". As your writing assistant, I can help with structure, content, grammar, citations, and research suggestions. Could you provide more details about what you need help with?";
  }
  
  return { content: response };
};
