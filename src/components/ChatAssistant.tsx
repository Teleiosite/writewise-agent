import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";
import { getChatbotResponse } from "@/services/ai-services";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your WriteWise Research Assistant. I can help refine statistical narratives, structure literature reviews, or check APA citation formats.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking AI assistant:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please check your API key settings or try again.",
        timestamp: new Date(),
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
      <div className="flex items-center justify-between p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-black dark:text-white" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">Research Assistant</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-none border-black dark:border-zinc-800 font-mono text-[11px] uppercase tracking-wider h-7"
          onClick={() => setMessages([messages[0]])}
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          New Thread
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-none p-3.5 border ${
                  message.role === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-sans"
                    : "bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white border-black dark:border-zinc-800 font-sans"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] uppercase opacity-70">
                  {message.role === "user" ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                  <span>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-none p-3.5 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="uppercase tracking-wider">Synthesizing Response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-black dark:border-zinc-800 bg-white dark:bg-black">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 font-mono"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask research, methodology, or formatting questions..."
            disabled={isLoading}
            className="flex-grow rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-5 border border-black dark:border-white shrink-0"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
