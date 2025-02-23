
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Save,
  FileText,
  Quote,
  BookOpen,
  ChevronLeft,
  PenTool,
} from "lucide-react";

interface WritingEditorProps {
  onClose: () => void;
  projectName: string;
}

export function WritingEditor({ onClose, projectName }: WritingEditorProps) {
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleContentChange = (value: string) => {
    setContent(value);
    // In a real implementation, we would make API calls here to get AI suggestions
    setSuggestions([
      "Consider adding more details about the methodology",
      "The introduction could be more engaging",
      "Add supporting evidence for this claim",
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onClose}
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{projectName}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Quote className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your project..."
              className="min-h-[500px] resize-none"
            />
          </Card>
        </div>

        <Card className="glass-card p-4 h-fit">
          <div className="flex items-center space-x-2 mb-4">
            <PenTool className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">AI Suggestions</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-3 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-gray-600">{suggestion}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
