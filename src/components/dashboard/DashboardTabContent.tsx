
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { WritingEditor } from "@/components/WritingEditor";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WritingStats } from "@/components/WritingStats";
import { WritingTracker } from "@/components/WritingTracker";
import { AIDetector } from "@/components/AIDetector";
import { TextHumanizer } from "@/components/TextHumanizer";
import type { TemplateType } from "@/components/DocumentTemplates";

interface DashboardTabContentProps {
  activeTab: string;
  projectName: string;
  onClose: () => void;
  template?: TemplateType;
  activeFeature?: string | null;
}

export function DashboardTabContent({ 
  activeTab, 
  projectName, 
  onClose, 
  template, 
  activeFeature 
}: DashboardTabContentProps) {
  return (
    <>
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
            <Card className="p-4 h-[600px] bg-gray-50 dark:bg-slate-900/60 dark:backdrop-blur-sm dark:border-slate-700/50">
              <h3 className="font-medium mb-3 dark:text-white">How the AI Assistant Can Help</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <span className="dark:text-gray-300">Ask for writing suggestions or feedback on specific paragraphs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <span className="dark:text-gray-300">Get help with research, facts, or finding relevant sources.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                  <span className="dark:text-gray-300">Brainstorm ideas for your next section or overcome writer's block.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</span>
                  <span className="dark:text-gray-300">Get help with grammar, style, or formatting questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">5</span>
                  <span className="dark:text-gray-300">Ask for explanations of complex topics related to your writing.</span>
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
    </>
  );
}
