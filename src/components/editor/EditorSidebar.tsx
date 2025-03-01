
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookmarkIcon } from "lucide-react";

interface EditorSidebarProps {
  sections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function EditorSidebar({ sections, activeSection, onSectionChange }: EditorSidebarProps) {
  return (
    <Card className="glass-card p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BookmarkIcon className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Sections</h3>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {sections && sections.length > 0 ? (
            sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionChange(section.id)}
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
