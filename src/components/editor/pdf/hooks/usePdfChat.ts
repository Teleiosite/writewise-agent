
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { useToast } from "@/hooks/use-toast";
import { callChatGptApi } from "@/services/api-client";

export function usePdfChat(initialPdfContent?: string, initialPdfName?: string) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>(initialPdfContent || "");
  const [pdfName, setPdfName] = useState<string>(initialPdfName || "");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history from localStorage when PDF changes
  useEffect(() => {
    if (pdfContent && pdfName) {
      const storageKey = `pdf-chat-${pdfName}`;
      const savedMessages = localStorage.getItem(storageKey);

      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setChatMessages(messagesWithDates);
          toast({
            title: "Chat history loaded",
            description: `Restored previous conversation about "${pdfName}"`,
          });
        } catch {
          initializeChat();
        }
      } else {
        initializeChat();
      }
    }
  }, [pdfContent, pdfName]);

  // Persist chat history to localStorage on every change
  useEffect(() => {
    if (chatMessages.length > 0 && pdfName) {
      localStorage.setItem(`pdf-chat-${pdfName}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, pdfName]);

  const initializeChat = () => {
    if (pdfContent && pdfName) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've analyzed "${pdfName}". You can now ask me questions about this document or use the "Generate Questions" feature to help you explore its content.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setChatMessages([welcomeMessage]);
      generateQuestions();
    }
  };

  const handlePdfLoaded = (name: string, content: string) => {
    setPdfName(name);
    setPdfContent(content);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
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

    try {
      // Limit context to ~4000 chars to stay within token limits
      const truncatedContent = pdfContent.substring(0, 4000);

      const data = await callChatGptApi(
        `You are a document analysis assistant. Answer questions accurately and concisely based ONLY on the following document content. If the answer is not clearly in the document, say so explicitly rather than guessing.

Document: "${pdfName}"

Content:
${truncatedContent}`,
        inputMessage
      );

      const responseContent =
        data.choices?.[0]?.message?.content?.trim() ??
        "I couldn't process that question. Please try again.";

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("PDF chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I couldn't answer that question right now. Please check your connection and try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error getting response",
        description: "Failed to connect to AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!pdfContent) return;
    setIsLoading(true);

    try {
      const truncatedContent = pdfContent.substring(0, 3000);

      const data = await callChatGptApi(
        'You are a research assistant. Generate exactly 6 insightful, specific questions that would help someone deeply understand and critically analyze the provided document. Return ONLY a valid JSON array of question strings. Example: ["Question 1?", "Question 2?"]',
        `Document: "${pdfName}"\n\nContent:\n${truncatedContent}`
      );

      const raw = data.choices?.[0]?.message?.content?.trim() ?? "[]";
      const clean = raw.replace(/```json|```/g, "").trim();

      try {
        const questions = JSON.parse(clean);
        if (Array.isArray(questions) && questions.length > 0) {
          setGeneratedQuestions(questions.slice(0, 6));
        } else {
          throw new Error("Invalid format");
        }
      } catch {
        setGeneratedQuestions([
          "What are the main findings or conclusions of this document?",
          "What methodology or approach does the document describe?",
          "Who is the intended audience for this document?",
          "What are the key recommendations made?",
          "What limitations or challenges are mentioned?",
          "How does this document contribute to its field?",
        ]);
      }
    } catch (error) {
      console.error("Generate questions error:", error);
      setGeneratedQuestions([
        "What are the main findings of this document?",
        "Can you summarize the methodology used?",
        "What are the key recommendations?",
        "What limitations are mentioned?",
        "Who is the target audience?",
        "What conclusions are drawn?",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

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
    handleQuestionClick,
  };
}
