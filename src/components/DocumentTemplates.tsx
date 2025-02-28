
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  ClipboardList,
} from "lucide-react";

export type TemplateType = {
  id: string;
  title: string;
  icon: JSX.Element;
  sections: string[];
  description: string;
};

export const documentTemplates: TemplateType[] = [
  {
    id: "research-paper",
    title: "Research Paper",
    icon: <BookOpen className="w-6 h-6" />,
    description: "Academic research paper with standard sections",
    sections: [
      "Abstract",
      "Introduction",
      "Literature Review",
      "Methodology",
      "Results",
      "Discussion",
      "Conclusion",
      "References",
    ],
  },
  {
    id: "technical-report",
    title: "Technical Report",
    icon: <FileText className="w-6 h-6" />,
    description: "Detailed technical documentation and analysis",
    sections: [
      "Executive Summary",
      "Project Overview",
      "Technical Analysis",
      "Implementation",
      "Testing Results",
      "Recommendations",
      "Appendices",
    ],
  },
  {
    id: "case-study",
    title: "Case Study",
    icon: <ClipboardList className="w-6 h-6" />,
    description: "In-depth analysis of a specific subject or project",
    sections: [
      "Overview",
      "Background",
      "Problem Statement",
      "Analysis",
      "Solutions",
      "Results",
      "Recommendations",
    ],
  },
];

export function DocumentTemplates({ onSelect }: { onSelect: (template: TemplateType) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {documentTemplates.map((template) => (
        <Card
          key={template.id}
          className="glass-card p-6 space-y-4 hover:shadow-xl transition-all cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100">
              {template.icon}
            </div>
            <h3 className="text-xl font-semibold">{template.title}</h3>
          </div>
          <p className="text-gray-600">{template.description}</p>
          <div className="text-sm text-gray-500">
            {template.sections.length} sections
          </div>
        </Card>
      ))}
    </div>
  );
}
