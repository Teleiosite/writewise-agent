
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileUp, Send, Loader2, Bot, User, LightbulbIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PdfChatInterfaceProps {
  onAddContent: (content: string) => void;
  pdfContent: string;
  pdfName: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function PdfChatInterface({ onAddContent, pdfContent, pdfName }: PdfChatInterfaceProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Only initialize chat if there's PDF content
  if (!pdfContent) return null;

  // If we have PDF content but no chat messages yet, add initial assistant message
  if (chatMessages.length === 0 && pdfName) {
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

  return (
    <Card className="p-4 h-[500px] flex flex-col">
      <div className="flex-grow flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chat with "{pdfName}"</h3>
        </div>
        
        <ScrollArea className="flex-grow border rounded-md p-3 mb-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateQuestions}
              disabled={isLoading}
            >
              <LightbulbIcon className="h-4 w-4 mr-1" />
              Generate Questions
            </Button>
          </div>
          
          {generatedQuestions.length > 0 && (
            <ScrollArea className="h-24 border rounded-md p-2">
              <div className="space-y-1">
                {generatedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left text-xs h-auto py-1"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask a question about the PDF..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button
            size="icon"
            disabled={isLoading || !inputMessage.trim()}
            onClick={handleSendMessage}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
