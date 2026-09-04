import React from 'react';
import { BookOpen, FileText, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import type { CoverageStats } from '@/services/researchPipelineService';

interface CoverageIndicatorProps {
  stats: CoverageStats;
  className?: string;
}

export function CoverageIndicator({ stats, className = '' }: CoverageIndicatorProps) {
  const { total, fullText, abstractOnly, paywalled, uploaded, coveragePercent, recommendation } = stats;

  const barColor =
    coveragePercent >= 80 ? 'bg-emerald-500' :
    coveragePercent >= 60 ? 'bg-amber-500' :
    'bg-orange-500';

  const statusIcon =
    coveragePercent >= 80 ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
    coveragePercent >= 60 ? <AlertCircle className="w-4 h-4 text-amber-500" /> :
    <AlertCircle className="w-4 h-4 text-orange-500" />;

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          Review Coverage
        </h3>
        <div className="flex items-center gap-1.5">
          {statusIcon}
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{coveragePercent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${coveragePercent}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <StatRow
          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
          label="Full text"
          value={`${fullText + uploaded}`}
          sub={`of ${total}`}
          highlight
        />
        <StatRow
          icon={<FileText className="w-3.5 h-3.5 text-amber-500" />}
          label="Abstract only"
          value={`${abstractOnly}`}
          sub={`of ${total}`}
        />
        <StatRow
          icon={<AlertCircle className="w-3.5 h-3.5 text-red-400" />}
          label="Paywalled"
          value={`${paywalled}`}
          sub="in Library Queue"
        />
        <StatRow
          icon={<Upload className="w-3.5 h-3.5 text-indigo-500" />}
          label="You uploaded"
          value={`${uploaded}`}
          sub="PDFs"
        />
      </div>

      {/* Recommendation */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        💡 {recommendation}
      </p>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-semibold ${highlight ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
            {value}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</span>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      </div>
    </div>
  );
}
