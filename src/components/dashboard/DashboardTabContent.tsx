import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { WritingEditor } from "@/components/WritingEditor";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WritingStats } from "@/components/WritingStats";
import DataAnalysis from "@/pages/DataAnalysis";
import { WritingTracker } from "@/components/WritingTracker";

interface DashboardTabContentProps {
  activeFeature: string | null;
  onClose: () => void;
  projectName: string;
  template?: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardTabContent({
  activeFeature,
  onClose,
  projectName,
  template,
  activeTab,
  setActiveTab
}: DashboardTabContentProps) {
  return (
    <div className="w-full font-sans">
      <TabsContent value="editor">
        <WritingEditor 
          onClose={onClose} 
          projectName={projectName} 
          template={template} 
          showCitations={activeFeature === "Citation Manager"}
          showPdfReader={activeFeature === "Read PDF"}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="assistant">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ChatAssistant />
          </div>
          <div className="md:col-span-1">
            <Card className="p-5 h-[600px] rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
              <span className="mono-badge mb-2">Research Guidance</span>
              <h3 className="font-bold text-sm text-black dark:text-white uppercase font-mono mt-1 mb-4">How Assistant Supports You</h3>
              <ul className="space-y-3 font-mono text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">Get writing suggestions and rhetoric improvements on specific paragraphs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">Verify statistical assumptions and empirical research findings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">Structure literature review sections and synthesize citations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">Formulate APA, MLA, or Harvard reference entries accurately.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0">5</span>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">Clarify complex methodology and SPSS syntax operations.</span>
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

      {/* Embedded Data Analysis Engine */}
      <TabsContent value="data-analysis">
        <DataAnalysis embedded onBack={() => setActiveTab('editor')} />
      </TabsContent>
    </div>
  );
}
