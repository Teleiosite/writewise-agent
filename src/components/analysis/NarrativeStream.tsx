import { useRef, useEffect } from 'react';
import { Copy, FileText, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NarrativeStreamProps {
  narrative: string;
  isStreaming: boolean;
  onInsertToEditor?: () => void;
}

export function NarrativeStream({ narrative, isStreaming, onInsertToEditor }: NarrativeStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Narrative</span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Generating...
            </span>
          )}
          {!isStreaming && narrative && (
            <span className="text-xs text-gray-400">{wordCount.toLocaleString()} words</span>
          )}
        </div>
        <div className="flex gap-2">
          {narrative && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-8">
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
              {onInsertToEditor && (
                <Button size="sm" onClick={onInsertToEditor} className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="w-3.5 h-3.5" />
                  Insert into Document
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-wrap',
          'min-h-[350px] max-h-[600px]',
          !narrative && 'flex items-center justify-center'
        )}
      >
        {!narrative ? (
          <p className="text-gray-300 dark:text-gray-600 text-center text-sm">
            Chapter 4 & 5 narrative will appear here as it streams...
          </p>
        ) : (
          <>
            {narrative}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
          </>
        )}
      </div>
    </div>
  );
}
