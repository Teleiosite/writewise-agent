
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Send, Loader2, Bot, User, FileText, MessageSquare, LightbulbIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface PdfReaderPanelProps {
  onAddContent: (content: string) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function PdfReaderPanel({ onAddContent }: PdfReaderPanelProps) {
  const [pdfContent, setPdfContent] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pdf");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept PDF files
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would parse the PDF content
    // For demo, we'll simulate extraction
    const reader = new FileReader();
    reader.onload = () => {
      // Set some sample extracted text
      setPdfName(file.name);
      setPdfContent(`[PDF Content Extracted from: ${file.name}]
      
This would be the actual content extracted from the PDF document. In a real application, the PDF would be parsed and its text content would be extracted here.

The system would analyze headings, paragraphs, tables, and other elements to provide structured content that you can work with.

Key information such as:
- Authors: John Smith, Jane Doe
- Publication date: October 2023
- Abstract: The study investigates the effects of climate change on coastal ecosystems...

You can select any portion of this text to add to your document, or click "Add to Document" to include the entire extracted content in your current section.`);
      
      // Add initial assistant message to chat
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've analyzed "${file.name}". You can now ask me questions about this document or use the "Generate Questions" feature to help you explore its content.`,
        role: "assistant",
        timestamp: new Date()
      };
      
      setChatMessages([welcomeMessage]);
      
      // Auto-generate some initial questions
      generateQuestions();
      
      toast({
        title: "PDF uploaded",
        description: `"${file.name}" has been uploaded and analyzed.`,
      });
    };
    reader.readAsText(file);
  };

  const handleAddPdfContent = () => {
    if (!pdfContent) return;
    onAddContent(pdfContent);
    
    toast({
      title: "Content added",
      description: "PDF content has been added to your document.",
    });
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

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">PDF Reader</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('pdf-file-upload')?.click()}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          <input
            id="pdf-file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        
        {pdfContent ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Content
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat PDF
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pdf" className="space-y-4">
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="whitespace-pre-wrap">{pdfContent}</div>
              </ScrollArea>
              
              <Button 
                className="w-full"
                onClick={handleAddPdfContent}
              >
                Add to Document
              </Button>
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="flex flex-col h-[300px]">
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
                    disabled={isLoading || !pdfContent}
                  />
                  <Button
                    size="icon"
                    disabled={isLoading || !inputMessage.trim() || !pdfContent}
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
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">Upload a PDF file to extract and analyze its content.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
