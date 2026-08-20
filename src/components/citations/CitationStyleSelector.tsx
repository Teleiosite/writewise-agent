import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CitationStyle } from "./types";

interface CitationStyleSelectorProps {
  selectedStyle: CitationStyle;
  onStyleChange: (style: CitationStyle) => void;
}

const STYLES_META: { id: CitationStyle; label: string; desc: string }[] = [
  { id: "APA", label: "APA 7th Edition", desc: "Social Sciences & Education (Smith & Doe, 2024)" },
  { id: "MLA", label: "MLA 9th Edition", desc: "Humanities & Literature (Smith 42)" },
  { id: "Chicago", label: "Chicago 17th", desc: "History & Author-Date (Smith 2024)" },
  { id: "Harvard", label: "Harvard Standard", desc: "UK & Commonwealth (Smith and Doe 2024)" },
  { id: "IEEE", label: "IEEE Transactions", desc: "Engineering & Computer Science [1]" },
  { id: "Vancouver", label: "Vancouver (NLM)", desc: "Biomedical & Clinical Medicine (1)" },
  { id: "Nature", label: "Nature / Springer", desc: "Scientific Journals (Superscript)" },
];

export function CitationStyleSelector({ selectedStyle, onStyleChange }: CitationStyleSelectorProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="text-zinc-500 uppercase tracking-wider text-[10px] hidden sm:inline">Style:</span>
      <Select value={selectedStyle} onValueChange={(val) => onStyleChange(val as CitationStyle)}>
        <SelectTrigger className="w-[180px] h-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black font-bold">
          <SelectValue placeholder="Select Style" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-black dark:border-zinc-800 font-mono text-xs bg-white dark:bg-black">
          {STYLES_META.map((style) => (
            <SelectItem key={style.id} value={style.id} className="cursor-pointer py-2">
              <div className="flex flex-col">
                <span className="font-bold">{style.label}</span>
                <span className="text-[10px] text-zinc-500">{style.desc}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
