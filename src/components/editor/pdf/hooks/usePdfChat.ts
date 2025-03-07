
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";

export function usePdfChat(initialPdfContent?: string, initialPdfName?: string) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>(initialPdfContent || "");
  const [pdfName, setPdfName] = useState<string>(initialPdfName || "");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handlePdfLoaded = (name: string, content: string) => {
    setPdfName(name);
    setPdfContent(content);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !pdfContent) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    setTimeout(() => {
      let responseContent = "";
      
      if (inputMessage.toLowerCase().includes("summary")) {
        responseContent = `Based on the content from "${pdfName}", the document primarily focuses on the effects of climate change on coastal ecosystems. The research was conducted by John Smith and Jane Doe in October 2023. The study highlights significant findings about environmental impacts and suggests potential mitigation strategies.`;
      } 
      else if (inputMessage.toLowerCase().includes("author")) {
        responseContent = `The document "${pdfName}" was authored by John Smith and Jane Doe. They are affiliated with the Environmental Research Institute according to the document metadata.`;
      }
      else if (inputMessage.toLowerCase().includes("when") || inputMessage.toLowerCase().includes("date")) {
        responseContent = `The publication date of "${pdfName}" is October 2023.`;
      }
      else if (inputMessage.toLowerCase().includes("conclusion") || inputMessage.toLowerCase().includes("findings")) {
        responseContent = `The study concludes that climate change has a significant impact on coastal ecosystems, particularly affecting biodiversity and shoreline integrity. The research suggests that immediate action is needed to mitigate these effects through conservation efforts and policy changes.`;
      }
      else {
        responseContent = `Based on my analysis of "${pdfName}", your question about "${inputMessage}" relates to the section discussing the methodology and findings. The document indicates that research was conducted using a mixed-methods approach, combining field observations with laboratory analysis. The specific data relevant to your question suggests that the coastal ecosystems showed variable responses to climate stressors depending on pre-existing environmental conditions.`;
      }
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }, 1500);
  };
  
  const generateQuestions = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const questions = [
        "What are the main findings of this study?",
        "Can you summarize the methodology used in this research?",
        "What are the key recommendations made by the authors?",
        "How does this research compare to previous studies in the field?",
        "What limitations are mentioned in the research?",
        "Who are the target audiences for this document?"
      ];
      
      setGeneratedQuestions(questions);
      setIsLoading(false);
    }, 2000);
  };
  
  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  useEffect(() => {
    if (pdfContent && chatMessages.length === 0 && pdfName) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've analyzed "${pdfName}". You can now ask me questions about this document or use the "Generate Questions" feature to help you explore its content.`,
        role: "assistant",
        timestamp: new Date()
      };
      
      setChatMessages([welcomeMessage]);
      
      generateQuestions();
    }
  }, [pdfContent, pdfName, chatMessages.length]);

  return {
    chatMessages,
    inputMessage,
    setInputMessage,
    generatedQuestions,
    isLoading,
    pdfContent,
    pdfName,
    scrollAreaRef,
    handlePdfLoaded,
    handleSendMessage,
    generateQuestions,
    handleQuestionClick
  };
}
