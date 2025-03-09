
import { Bot, User } from "lucide-react";
import { ChatMessage } from "./types";
import { useEffect, useState } from "react";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Small delay for staggered animation effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 transform transition-all duration-300 ${
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-4 opacity-0"
        } ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.role === "user" ? (
            <User className="h-4 w-4" aria-label="User message" />
          ) : (
            <Bot className="h-4 w-4" aria-label="Assistant message" />
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
  );
}
