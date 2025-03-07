
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./types";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, isLoading, scrollAreaRef }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-grow border rounded-md p-3 mb-3" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        
        {isLoading && <ThinkingIndicator />}
      </div>
    </ScrollArea>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
}
