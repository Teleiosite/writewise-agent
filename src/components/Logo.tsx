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
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2 font-sans", className)}>
      <Sparkles 
        className={cn(
          sizeClasses[size],
          "text-black dark:text-white",
          iconClassName
        )} 
      />
      {withText && (
        <span className={cn(
          "font-black tracking-tight text-black dark:text-white uppercase font-mono",
          textSizeClasses[size],
          textClassName
        )}>
          WriteWise
        </span>
      )}
    </div>
  );
}
