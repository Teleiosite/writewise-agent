
import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ 
  className, 
  textClassName, 
  iconClassName,
  size = "md", 
  withText = true 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sparkles 
        className={cn(
          sizeClasses[size],
          "text-blue-600 dark:text-blue-400 animate-pulse",
          iconClassName
        )} 
      />
      {withText && (
        <span className={cn(
          "font-bold tracking-tight",
          textSizeClasses[size],
          "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent",
          textClassName
        )}>
          Writewise
        </span>
      )}
    </div>
  );
}
