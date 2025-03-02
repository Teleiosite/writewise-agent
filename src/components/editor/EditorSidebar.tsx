
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { BookmarkIcon, Plus, Save, X } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";

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
    <Card className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Sections</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowNewSectionForm(!showNewSectionForm)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showNewSectionForm && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-grow"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCreateSection}
              className="flex-grow"
              disabled={!newSectionTitle.trim()}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNewSectionForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {sections && sections.length > 0 ? (
            sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No sections available
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
