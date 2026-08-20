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
  const current = STYLES_META.find(s => s.id === selectedStyle);

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="text-zinc-500 uppercase tracking-wider text-[10px] hidden sm:inline">Citation Style:</span>
      <Select value={selectedStyle} onValueChange={(val) => onStyleChange(val as CitationStyle)}>
        <SelectTrigger className="w-[190px] h-9 rounded-none border border-black dark:border-zinc-700 text-xs font-mono bg-white dark:bg-black font-bold px-3 focus:ring-1 focus:ring-black dark:focus:ring-white">
          <span className="truncate">{current?.label || selectedStyle}</span>
        </SelectTrigger>
        <SelectContent className="w-[280px] rounded-none border border-black dark:border-zinc-800 font-mono text-xs bg-white dark:bg-black shadow-lg">
          {STYLES_META.map((style) => (
            <SelectItem key={style.id} value={style.id} className="cursor-pointer py-2.5 px-3">
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-black dark:text-white">{style.label}</span>
                <span className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-tight">{style.desc}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
