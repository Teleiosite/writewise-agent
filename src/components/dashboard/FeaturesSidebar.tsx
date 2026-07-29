
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
      name: "AI Data Analysis",
      description: "Python-computed statistics, SPSS syntax generation, and Chapter 4/5 narrative creation.",
      icon: BookOpen,
      color: "blue"
    },
    {
      name: "AI-Powered Editor",
      description: "Smart writing workstation with real-time academic grammar and structure guidance.",
      icon: FileText,
      color: "emerald"
    },
    {
      name: "Citation Manager",
      description: "Manage references and citations in APA, MLA, Chicago, and Harvard formats.",
      icon: Users,
      color: "green"
    },
    {
      name: "Research Assistant",
      description: "Extract insights, verify literature, and analyze scientific papers.",
      icon: BookOpen,
      color: "amber"
    },
    {
      name: "Read PDF & Chat",
      description: "Import PDFs and interact with your literature directly alongside your canvas.",
      icon: FileText,
      color: "purple"
    },
    {
      name: "Progress Tracking",
      description: "Track writing velocity, milestones, and daily research streak goals.",
      icon: Calendar,
      color: "indigo"
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
