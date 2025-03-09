
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `Switched to ${newTheme} mode for better ${newTheme === 'dark' ? 'evening' : 'daytime'} viewing.`,
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-300 ease-in-out"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-transform duration-300 ease-in-out" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-300 animate-spin-slow" />
      )}
      <span className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-800/20' : 'bg-slate-200/20'} rounded-md`}></span>
    </Button>
  );
}
