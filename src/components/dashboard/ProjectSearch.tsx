import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectSearchProps {
  onSearch: (searchTerm: string) => void;
}

export function ProjectSearch({ onSearch }: ProjectSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
  };
  
  return (
    <div className="relative mb-6 font-sans">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        placeholder="Search workspaces by project title..."
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        className="pl-10 w-full h-11 text-sm rounded-none border-black dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
        aria-label="Search projects"
      />
    </div>
  );
}
