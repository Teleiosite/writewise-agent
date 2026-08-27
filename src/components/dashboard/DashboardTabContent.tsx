import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { WritingEditor } from "@/components/WritingEditor";
import { ChatAssistant } from "@/components/ChatAssistant";
import DataAnalysis from "@/pages/DataAnalysis";

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
    <div className="w-full h-full font-sans">
      {/* Editor tab — h-full so EditorMain's flex layout fills the viewport pane */}
      <TabsContent value="editor" className="h-full m-0 p-0 data-[state=inactive]:hidden">
        <WritingEditor 
          onClose={onClose} 
          projectName={projectName} 
          template={template} 
          showCitations={activeFeature === "Citation Manager"}
          showPdfReader={activeFeature === "Read PDF" || activeFeature === "Read PDF & Chat"}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      {/* Assistance tab — max-width container, own scroll */}
      <TabsContent value="assistant" className="m-0 data-[state=inactive]:hidden overflow-y-auto h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-6">
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

      {/* Data Analysis tab — own scroll */}
      <TabsContent value="data-analysis" className="m-0 data-[state=inactive]:hidden overflow-y-auto h-full">
        <DataAnalysis embedded onBack={() => setActiveTab('editor')} />
      </TabsContent>
    </div>
  );
}
