import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { BookmarkIcon, Plus, Save, X } from "lucide-react";
import { useEditor } from "@/contexts/editor";

export function EditorSidebar() {
  const { sections, activeSection, setActiveSection, createSection } = useEditor();
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const handleCreateSection = () => {
    if (newSectionTitle.trim()) {
      createSection(newSectionTitle);
      setNewSectionTitle("");
      setShowNewSectionForm(false);
    }
  };

  return (
    <Card className="p-4 space-y-4 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
      <div className="flex items-center justify-between mb-4 border-b border-black dark:border-zinc-800 pb-3 font-mono">
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="h-4 w-4 text-black dark:text-white" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">Manuscript Sections</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowNewSectionForm(!showNewSectionForm)}
          className="h-7 w-7 p-0 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <Plus className="h-4 w-4 text-black dark:text-white" />
        </Button>
      </div>

      {showNewSectionForm && (
        <div className="space-y-2 font-mono">
          <div className="flex gap-2">
            <Input
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title..."
              className="flex-grow rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleCreateSection}
              className="flex-grow rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider border border-black dark:border-white"
              disabled={!newSectionTitle.trim()}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Save Section
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNewSectionForm(false)}
              className="rounded-none border-black dark:border-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-[500px]">
        <div className="space-y-1 font-mono text-xs">
          {sections && sections.length > 0 ? (
            sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={`w-full justify-start rounded-none border text-xs font-mono uppercase tracking-wider transition-all ${
                  activeSection === section.id
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-800 hover:text-black dark:hover:text-white"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-zinc-500 font-mono text-xs uppercase">
              No sections created
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
