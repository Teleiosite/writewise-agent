import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AcademicCitation, AcademicWorkType, Author } from "@/services/citationEngine";
import { Plus, Trash2, Save, X } from "lucide-react";

interface CitationFormProps {
  onSave: (citation: AcademicCitation) => void;
  onCancel: () => void;
  initialCitation?: AcademicCitation;
}

export function CitationForm({ onSave, onCancel, initialCitation }: CitationFormProps) {
  const [type, setType] = useState<AcademicWorkType>(initialCitation?.type || 'journal');
  const [title, setTitle] = useState(initialCitation?.title || '');
  const [authors, setAuthors] = useState<Author[]>(
    initialCitation?.authors?.length ? initialCitation.authors : [{ family: '', given: '' }]
  );
  const [year, setYear] = useState(initialCitation?.year || String(new Date().getFullYear()));
  const [source, setSource] = useState(initialCitation?.source || '');
  const [volume, setVolume] = useState(initialCitation?.volume || '');
  const [issue, setIssue] = useState(initialCitation?.issue || '');
  const [pages, setPages] = useState(initialCitation?.pages || '');
  const [doi, setDoi] = useState(initialCitation?.doi || '');
  const [url, setUrl] = useState(initialCitation?.url || '');
  const [publisher, setPublisher] = useState(initialCitation?.publisher || '');

  const handleAddAuthor = () => {
    setAuthors([...authors, { family: '', given: '' }]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: 'family' | 'given', value: string) => {
    const next = [...authors];
    next[index] = { ...next[index], [field]: value };
    setAuthors(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validAuthors = authors
      .map(a => ({
        family: a.family?.trim() || '',
        given: a.given?.trim() || '',
        name: `${a.given || ''} ${a.family || ''}`.trim()
      }))
      .filter(a => a.family || a.given);

    const citation: AcademicCitation = {
      id: initialCitation?.id || `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      authors: validAuthors.length > 0 ? validAuthors : [{ name: 'Anonymous' }],
      year: year.trim() || String(new Date().getFullYear()),
      source: source.trim() || 'Academic Publication',
      volume: volume.trim() || undefined,
      issue: issue.trim() || undefined,
      pages: pages.trim() || undefined,
      type,
      doi: doi.trim() || undefined,
      url: url.trim() || undefined,
      publisher: publisher.trim() || undefined,
      sourceDatabase: 'Manual'
    };

    onSave(citation);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-black dark:border-zinc-800 pb-2">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
          Manual Reference Entry
        </h4>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-6 w-6 p-0">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Publication Type */}
      <div className="space-y-1">
        <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Publication Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as AcademicWorkType)}>
          <SelectTrigger className="h-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none border-black dark:border-zinc-800 text-xs font-mono">
            <SelectItem value="journal">Journal Article</SelectItem>
            <SelectItem value="book">Book / Monograph</SelectItem>
            <SelectItem value="chapter">Book Chapter</SelectItem>
            <SelectItem value="conference">Conference Proceedings</SelectItem>
            <SelectItem value="thesis">Dissertation / Master's Thesis</SelectItem>
            <SelectItem value="preprint">Preprint (arXiv / SSRN)</SelectItem>
            <SelectItem value="website">Online Academic Resource / Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Document Title *</Label>
        <Input
          required
          placeholder="e.g. Attention Is All You Need"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono"
        />
      </div>

      {/* Authors List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Authors</Label>
          <button
            type="button"
            onClick={handleAddAuthor}
            className="text-[10px] font-mono uppercase text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" /> Add Author
          </button>
        </div>

        {authors.map((author, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Last name (e.g. Kahneman)"
              value={author.family || ''}
              onChange={(e) => handleAuthorChange(index, 'family', e.target.value)}
              className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono flex-1"
            />
            <Input
              placeholder="First name / Initial (e.g. Daniel)"
              value={author.given || ''}
              onChange={(e) => handleAuthorChange(index, 'given', e.target.value)}
              className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono flex-1"
            />
            {authors.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAuthor(index)}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Source & Year */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            {type === 'book' ? 'Publisher' : 'Journal / Venue Name'}
          </Label>
          <Input
            placeholder={type === 'book' ? 'e.g. Oxford University Press' : 'e.g. Journal of Applied Psychology'}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="h-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Year</Label>
          <Input
            placeholder="2024"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono"
          />
        </div>
      </div>

      {/* Volume, Issue, Pages */}
      {type !== 'book' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Volume</Label>
            <Input
              placeholder="48"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Issue / No.</Label>
            <Input
              placeholder="3"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Pages</Label>
            <Input
              placeholder="112-128"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* DOI & URL */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">DOI (Optional)</Label>
          <Input
            placeholder="10.1038/..."
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">URL / Link</Label>
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-7 rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-black dark:border-zinc-800">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="rounded-none font-mono text-xs uppercase">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider border border-black dark:border-white">
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Reference
        </Button>
      </div>
    </form>
  );
}
