
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { PdfUploader } from "./PdfUploader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { usePdfChat } from "./hooks/usePdfChat";

export interface PdfChatInterfaceProps {
  onAddContent: (content: string) => void;
  pdfContent?: string;
  pdfName?: string;
}

export function PdfChatInterface({ 
  onAddContent,
  pdfContent: initialPdfContent,
  pdfName: initialPdfName 
}: PdfChatInterfaceProps) {
  const {
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
  } = usePdfChat(initialPdfContent, initialPdfName);

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
          <EmptyState />
        )}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 border rounded-md flex-grow flex flex-col items-center justify-center">
      <Upload className="h-12 w-12 text-gray-400 mb-2" />
      <p className="text-gray-500">Upload a PDF file to chat with it.</p>
      <p className="text-gray-400 text-sm mt-2">You can ask questions about the content of the PDF.</p>
    </div>
  );
}
