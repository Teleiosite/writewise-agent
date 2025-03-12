
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("hasSeenWelcomeBanner");
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);
  
  const dismissBanner = () => {
    localStorage.setItem("hasSeenWelcomeBanner", "true");
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white p-4 rounded-lg shadow-md mb-6 animate-scale-in">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-white hover:bg-white/20" 
        onClick={dismissBanner}
      >
        <X className="h-4 w-4" />
      </Button>
      <h3 className="font-bold text-lg mb-1">Welcome to Writewise!</h3>
      <p className="text-sm opacity-90">
        Your AI-powered academic writing assistant. Create projects, get AI-powered suggestions, 
        and streamline your academic writing process.
      </p>
      <div className="mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          onClick={dismissBanner}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
