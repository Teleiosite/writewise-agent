
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WritingEditor } from "@/components/WritingEditor";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WritingStats } from "@/components/WritingStats";
import { WritingTracker } from "@/components/WritingTracker";
import { AIDetector } from "@/components/AIDetector";
import { TextHumanizer } from "@/components/TextHumanizer";
import { FileText, MessageSquare, BarChart2, Target, ChevronLeft, AlertTriangle } from "lucide-react";
import type { TemplateType } from "./DocumentTemplates";

interface WritingDashboardProps {
  projectName: string;
  onClose: () => void;
  template?: TemplateType;
  activeFeature?: string | null;
}

export function WritingDashboard({ projectName, onClose, template, activeFeature }: WritingDashboardProps) {
  const [activeTab, setActiveTab] = useState("editor");
  
  useEffect(() => {
    // Set the active tab based on the selected feature
    if (activeFeature) {
      switch (activeFeature) {
        case "AI-Powered Editor":
          setActiveTab("editor");
          break;
        case "Citation Manager":
          setActiveTab("editor");
          // We'll handle showing the citation manager in the WritingEditor component
          localStorage.setItem("show-citation-manager", "true");
          break;
        case "Progress Tracking":
          setActiveTab("goals");
          break;
        case "Research Assistant":
          setActiveTab("assistant");
          break;
        case "AI Detector":
          setActiveTab("ai-detector");
          break;
        case "Text Humanizer":
          setActiveTab("humanizer");
          break;
        case "Read PDF":
          setActiveTab("editor");
          localStorage.setItem("show-pdf-reader", "true");
          break;
        default:
          setActiveTab("editor");
      }
    }
  }, [activeFeature]);

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Button>
        <h1 className="text-2xl font-bold">{projectName}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-2">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </TabsTrigger>
          <TabsTrigger value="ai-detector" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>AI Detector</span>
          </TabsTrigger>
          <TabsTrigger value="humanizer" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Humanizer</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <WritingEditor 
            onClose={onClose} 
            projectName={projectName} 
            template={template} 
            showCitations={activeFeature === "Citation Manager"}
            showPdfReader={activeFeature === "Read PDF"}
          />
        </TabsContent>
        
        <TabsContent value="assistant">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ChatAssistant />
            </div>
            <div className="md:col-span-1">
              <Card className="p-4 h-[600px] bg-gray-50">
                <h3 className="font-medium mb-3">How the AI Assistant Can Help</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                    <span>Ask for writing suggestions or feedback on specific paragraphs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                    <span>Get help with research, facts, or finding relevant sources.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                    <span>Brainstorm ideas for your next section or overcome writer's block.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</span>
                    <span>Get help with grammar, style, or formatting questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">5</span>
                    <span>Ask for explanations of complex topics related to your writing.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <WritingStats projectName={projectName} />
        </TabsContent>
        
        <TabsContent value="goals">
          <WritingTracker projectName={projectName} />
        </TabsContent>
        
        <TabsContent value="ai-detector">
          <AIDetector />
        </TabsContent>
        
        <TabsContent value="humanizer">
          <TextHumanizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
