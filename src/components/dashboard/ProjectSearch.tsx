
import React, { useState } from "react";
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
  
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={handleSearch}
        className="pl-10 w-full"
      />
    </div>
  );
}
