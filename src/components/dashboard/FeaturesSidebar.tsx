
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar, FileText, Users, AlertTriangle, Menu } from "lucide-react";

interface FeaturesSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onFeatureClick: (feature: string) => void;
}

export function FeaturesSidebar({ mobileMenuOpen, setMobileMenuOpen, onFeatureClick }: FeaturesSidebarProps) {
  const features = [
    {
      name: "AI-Powered Editor",
      description: "Smart writing suggestions and real-time grammar feedback as you write.",
      icon: FileText,
      color: "blue"
    },
    {
      name: "Citation Manager",
      description: "Easily manage references and citations in multiple formats (APA, MLA, Chicago).",
      icon: Users,
      color: "green"
    },
    {
      name: "Progress Tracking",
      description: "Set goals, track your writing habits, and visualize your progress over time.",
      icon: Calendar,
      color: "purple"
    },
    {
      name: "Research Assistant",
      description: "AI-powered research tools to find relevant sources and generate insights.",
      icon: BookOpen,
      color: "amber"
    },
    {
      name: "AI Detector",
      description: "Analyze text to determine if it was likely created by AI. Perfect for educators and reviewers.",
      icon: AlertTriangle,
      color: "red"
    },
    {
      name: "Text Humanizer",
      description: "Transform AI-generated content into natural-sounding text that passes AI detection.",
      icon: FileText,
      color: "indigo"
    },
    {
      name: "Read PDF",
      description: "Import and analyze PDF documents to extract key information and insights.",
      icon: FileText,
      color: "orange"
    }
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-900/60 z-40 transform transition-transform duration-300 ease-in-out
      md:static md:w-1/4 md:translate-x-0 md:shadow-none
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between border-b dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold dark:text-white">Features & Tools</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            &times;
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-2">
          <div className="px-2 space-y-1">
            {features.map((feature) => (
              <button
                key={feature.name}
                onClick={() => onFeatureClick(feature.name)}
                className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-800 dark:text-${feature.color}-300 rounded-full w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1 dark:text-white">{feature.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t dark:border-slate-700/50">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Need Help?</p>
            <p className="text-xs">Access our comprehensive documentation or contact support for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
