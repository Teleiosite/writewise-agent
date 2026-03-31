
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
export const getChatbotResponse = async (message: string): Promise<ChatResponse> => {
  const apiProvider = localStorage.getItem("apiProvider");
  const apiKey = localStorage.getItem("apiKey");

  if (apiProvider && apiKey) {
    try {
      let apiUrl = "";
      let requestBody: any = {};

      switch (apiProvider) {
        case "OpenAI":
          apiUrl = "https://api.openai.com/v1/chat/completions";
          requestBody = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
          };
          break;
        case "DeepSeek":
          apiUrl = "https://api.deepseek.com/v1/chat/completions";
          requestBody = {
            model: "deepseek-chat",
            messages: [{ role: "user", content: message }],
          };
          break;
        case "Grok":
          apiUrl = "https://api.x.ai/grok";
          requestBody = {
            prompt: message,
          };
          break;
        case "Gemini":
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
          requestBody = {
            contents: [{ parts: [{ text: message }] }],
          };
          break;
        default:
          console.log("Unknown API provider, using mock response.");
      }

      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            `API request failed: ${errorData.error?.message || response.statusText}`,
          );
        }

        const data = await response.json();

        let content = "";
        switch (apiProvider) {
          case "OpenAI":
            content = data.choices[0]?.message?.content.trim() || "";
            break;
          case "DeepSeek":
            content = data.choices[0]?.message?.content.trim() || "";
            break;
          case "Gemini":
            content =
              data.candidates[0]?.content?.parts[0]?.text.trim() || "";
            break;
          case "Grok":
            console.log("Grok API response handling is not implemented yet.");
            content = "Grok response (mocked).";
            break;
          default:
            content = "Unknown API provider response.";
        }

        if (!content) {
          console.error("No content found in API response:", data);
          return {
            content:
              "Sorry, I received an empty response from the AI service.",
          };
        }

        return { content };
      }
    } catch (error) {
      console.error("API call failed:", error);
      return {
        content:
          "Sorry, I am unable to connect to the AI service at the moment.",
      };
    }
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple response mapping based on keywords
  let response = "";

  if (message.toLowerCase().includes("help") || message.toLowerCase().includes("how to")) {
    response =
      "I can help you with your writing! What specific aspect would you like assistance with? I can provide feedback on structure, grammar, content, or research suggestions.";
  } else if (
    message.toLowerCase().includes("thesis") ||
    message.toLowerCase().includes("argument")
  ) {
    response =
      "A strong thesis statement is clear, specific, and arguable. Try to make your main argument focused on a specific aspect rather than being too broad. Would you like me to review your thesis statement?";
  } else if (
    message.toLowerCase().includes("citation") ||
    message.toLowerCase().includes("reference")
  ) {
    response =
      "For academic writing, it's important to follow the citation style required by your institution (APA, MLA, Chicago, etc.). Make sure to cite all sources properly to avoid plagiarism. Would you like information about a specific citation style?";
  } else if (
    message.toLowerCase().includes("structure") ||
    message.toLowerCase().includes("organize")
  ) {
    response =
      "A well-structured academic paper typically includes an introduction with a thesis statement, body paragraphs that each focus on a single idea, and a conclusion that synthesizes your arguments. Consider creating an outline before writing to organize your thoughts.";
  } else if (
    message.toLowerCase().includes("research") ||
    message.toLowerCase().includes("sources")
  ) {
    response =
      "When conducting research, focus on peer-reviewed journals, academic books, and reputable sources. University libraries and academic databases like JSTOR, Google Scholar, or PubMed are excellent places to start your research.";
  } else {
    response =
      'I understand you\'re asking about \"' +
      message +
      '\". As your writing assistant, I can help with structure, content, grammar, citations, and research suggestions. Could you provide more details about what you need help with?';
  }

  return { content: response };
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

