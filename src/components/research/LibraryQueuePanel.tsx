import React, { useState } from 'react';
import {
  ExternalLink, Upload, CheckCircle2, Star, BookMarked,
  ChevronDown, ChevronUp, Globe, BookOpen, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LibraryQueueItem } from '@/services/researchPipelineService';
import { buildLibraryLink } from '@/services/universityResolver';

interface LibraryQueuePanelProps {
  items: LibraryQueueItem[];
  userUniversity?: string;
  onUpload: (item: LibraryQueueItem, text: string, fileName: string) => void;
  className?: string;
}

export function LibraryQueuePanel({
  items,
  userUniversity,
  onUpload,
  className = '',
}: LibraryQueuePanelProps) {
  const critical = items.filter(i => i.priority === 'critical');
  const important = items.filter(i => i.priority === 'important');
  const supplementary = items.filter(i => i.priority === 'supplementary');

  if (items.length === 0) {
    return (
      <div className={`bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center ${className}`}>
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
          All papers have open access!
        </h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-500">
          Full text retrieved for all found papers. Your literature review will be highly detailed.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-indigo-500" />
          Library Queue
          <Badge variant="secondary" className="text-xs">{items.length} papers</Badge>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Download from your university library, then upload here
        </p>
      </div>

      {critical.length > 0 && (
        <PrioritySection
          title="⭐ Critical"
          subtitle="Must-read — highly cited foundational papers"
          items={critical}
          userUniversity={userUniversity}
          onUpload={onUpload}
          badgeClass="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          borderClass="border-red-200 dark:border-red-900"
        />
      )}

      {important.length > 0 && (
        <PrioritySection
          title="📌 Important"
          subtitle="Well-established studies relevant to your topic"
          items={important}
          userUniversity={userUniversity}
          onUpload={onUpload}
          badgeClass="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
          borderClass="border-amber-200 dark:border-amber-900"
        />
      )}

      {supplementary.length > 0 && (
        <PrioritySection
          title="📎 Supplementary"
          subtitle="Adds breadth and supporting evidence"
          items={supplementary}
          userUniversity={userUniversity}
          onUpload={onUpload}
          badgeClass="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          borderClass="border-zinc-200 dark:border-zinc-800"
        />
      )}
    </div>
  );
}

// ─── Priority section ──────────────────────────────────────────────────────────

function PrioritySection({
  title, subtitle, items, userUniversity, onUpload, badgeClass, borderClass,
}: {
  title: string;
  subtitle: string;
  items: LibraryQueueItem[];
  userUniversity?: string;
  onUpload: (item: LibraryQueueItem, text: string, fileName: string) => void;
  badgeClass: string;
  borderClass: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`border ${borderClass} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
      >
        <div className="text-left">
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{title}</span>
          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
            {items.length}
          </span>
          {collapsed ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
        </div>
      </button>

      {!collapsed && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map(item => (
            <QueueCard
              key={item.paper.id}
              item={item}
              userUniversity={userUniversity}
              onUpload={onUpload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual queue card ─────────────────────────────────────────────────────

function QueueCard({
  item,
  userUniversity,
  onUpload,
}: {
  item: LibraryQueueItem;
  userUniversity?: string;
  onUpload: (item: LibraryQueueItem, text: string, fileName: string) => void;
}) {
  const { paper, priorityReason, accessLinks, uploaded } = item;
  const authorStr = paper.authors.length > 2
    ? `${paper.authors[0]} et al.`
    : paper.authors.join(', ');

  const libraryUrl = userUniversity && paper.doi
    ? buildLibraryLink(paper.doi, userUniversity)
    : accessLinks.doi;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) onUpload(item, text, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`p-4 ${uploaded ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-white dark:bg-zinc-900/30'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
            {paper.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {authorStr} ({paper.year}) · <em>{paper.journal}</em>
            {paper.citationCount > 0 && (
              <span className="ml-1 text-indigo-500">· Cited {paper.citationCount.toLocaleString()}×</span>
            )}
          </p>
        </div>
        {uploaded && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        )}
      </div>

      {/* Priority reason */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1">
        <Star className="w-3 h-3 text-amber-400" />
        {priorityReason}
      </p>

      {/* Access links */}
      <div className="flex flex-wrap gap-2 mb-3">
        {paper.doi && (
          <AccessLink href={accessLinks.doi} label="DOI" icon={<Globe className="w-3 h-3" />} />
        )}
        <AccessLink href={accessLinks.semanticScholar} label="Semantic Scholar" icon={<BookOpen className="w-3 h-3" />} />
        <AccessLink href={accessLinks.googleScholar} label="Google Scholar" icon={<ExternalLink className="w-3 h-3" />} />
        <AccessLink href={accessLinks.researchGate} label="ResearchGate" icon={<ExternalLink className="w-3 h-3" />} />
        {userUniversity && paper.doi && (
          <AccessLink
            href={libraryUrl}
            label={`${userUniversity.split(' ')[0]} Library`}
            icon={<Landmark className="w-3 h-3" />}
            highlight
          />
        )}
      </div>

      {/* Upload */}
      {uploaded ? (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          PDF uploaded — included in synthesis
        </div>
      ) : (
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-medium transition-colors border border-indigo-200 dark:border-indigo-800">
          <Upload className="w-3 h-3" />
          Upload PDF
          <input
            type="file"
            accept=".pdf,.txt"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
      )}
    </div>
  );
}

function AccessLink({
  href, label, icon, highlight = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-colors ${
        highlight
          ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
      }`}
    >
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
    </a>
  );
}
