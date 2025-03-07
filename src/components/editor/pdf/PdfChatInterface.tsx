
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bot, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "./types";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { PdfUploader } from "./PdfUploader";

interface PdfChatInterfaceProps {
  onAddContent: (content: string) => void;
}

export function PdfChatInterface({ onAddContent }: PdfChatInterfaceProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePdfLoaded = (name: string, content: string) => {
    setPdfName(name);
    setPdfContent(content);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !pdfContent) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Simulate response delay
    setTimeout(() => {
      // Generate a mock response based on the question
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
      
      // Scroll to bottom after message is added
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }, 1500);
  };
  
  const generateQuestions = () => {
    setIsLoading(true);
    
    // Simulate generating questions based on the PDF content
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

  // Initialize chat if there's PDF content and no messages yet
  useEffect(() => {
    if (pdfContent && chatMessages.length === 0 && pdfName) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've analyzed "${pdfName}". You can now ask me questions about this document or use the "Generate Questions" feature to help you explore its content.`,
        role: "assistant",
        timestamp: new Date()
      };
      
      setChatMessages([welcomeMessage]);
      
      // Auto-generate some initial questions
      generateQuestions();
    }
  }, [pdfContent, pdfName, chatMessages.length]);

  return (
    <Card className="p-4 h-[500px] flex flex-col">
      <div className="flex-grow flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chat with PDF</h3>
          <PdfUploader onPdfLoaded={handlePdfLoaded} />
        </div>
        
        {pdfContent ? (
          <>
            <ChatMessages 
              messages={chatMessages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
            />
            
            <SuggestedQuestions
              questions={generatedQuestions}
              onQuestionClick={handleQuestionClick}
              onGenerateQuestions={generateQuestions}
              isLoading={isLoading}
            />
            
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="text-center py-8 border rounded-md flex-grow flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Upload a PDF file to chat with it.</p>
            <p className="text-gray-400 text-sm mt-2">You can ask questions about the content of the PDF.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
