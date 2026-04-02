import { useState } from 'react';
import { CodebookVariable } from '@/types/analysis.types';
import { Wand2, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CodebookEditorProps {
  codebook: CodebookVariable[];
  onChange: (codebook: CodebookVariable[]) => void;
  onAutoDetect?: () => void;
  isDetecting?: boolean;
}

const TYPES = ['nominal', 'ordinal', 'scale'] as const;
const ROLES = ['None', 'IV', 'DV', 'Mediator', 'Moderator', 'Control'] as const;

const TYPE_COLORS: Record<string, string> = {
  nominal: 'bg-purple-100 text-purple-700 border-purple-200',
  ordinal: 'bg-blue-100 text-blue-700 border-blue-200',
  scale: 'bg-green-100 text-green-700 border-green-200',
};
const ROLE_COLORS: Record<string, string> = {
  IV: 'bg-orange-100 text-orange-700',
  DV: 'bg-red-100 text-red-700',
  Mediator: 'bg-yellow-100 text-yellow-700',
  Moderator: 'bg-pink-100 text-pink-700',
  Control: 'bg-gray-100 text-gray-600',
  None: 'bg-gray-50 text-gray-400',
};

export function CodebookEditor({ codebook, onChange, onAutoDetect, isDetecting }: CodebookEditorProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const updateVar = (i: number, patch: Partial<CodebookVariable>) => {
    const next = [...codebook];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const addVar = () => {
    onChange([...codebook, {
      column: '', label: '', type: 'scale', role: 'None',
      values: null, missing_code: null, section_label: null,
    }]);
  };

  const removeVar = (i: number) => {
    onChange(codebook.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Variable Codebook</h3>
          <p className="text-xs text-gray-400 mt-0.5">{codebook.length} variables detected. Review and correct as needed.</p>
        </div>
        <div className="flex gap-2">
          {onAutoDetect && (
            <Button variant="outline" size="sm" onClick={onAutoDetect} disabled={isDetecting} className="gap-1.5 text-xs">
              <Wand2 className={cn('w-3.5 h-3.5', isDetecting && 'animate-spin')} />
              {isDetecting ? 'Detecting...' : 'Re-detect with AI'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addVar} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Variable
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        {TYPES.map(t => <span key={t} className={cn('px-2 py-0.5 rounded-full border font-semibold', TYPE_COLORS[t])}>{t}</span>)}
        <span className="text-gray-400 mx-1">·</span>
        {ROLES.filter(r => r !== 'None').map(r => <span key={r} className={cn('px-2 py-0.5 rounded-full font-semibold', ROLE_COLORS[r])}>{r}</span>)}
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] gap-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          <span>Column</span>
          <span>Label</span>
          <span>Type</span>
          <span>Role</span>
          <span></span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
          {codebook.map((v, i) => (
            <div key={i} className="group">
              <div className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] gap-0 px-4 py-2.5 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate pr-2">{v.column}</span>
                <input
                  value={v.label}
                  onChange={e => updateVar(i, { label: e.target.value })}
                  className="text-xs bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 focus:outline-none rounded-md px-2 py-1 w-full transition-all text-gray-700 dark:text-gray-200"
                  placeholder="Add label..."
                />
                <div className="relative">
                  <select
                    value={v.type}
                    onChange={e => updateVar(i, { type: e.target.value as CodebookVariable['type'] })}
                    className={cn('text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer appearance-none w-full focus:outline-none', TYPE_COLORS[v.type])}
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="relative ml-1">
                  <select
                    value={v.role}
                    onChange={e => updateVar(i, { role: e.target.value as CodebookVariable['role'] })}
                    className={cn('text-[11px] font-bold px-2 py-1 rounded-full cursor-pointer appearance-none w-full focus:outline-none', ROLE_COLORS[v.role])}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    className="p-1 text-gray-300 hover:text-blue-500 transition-colors"
                    title="Edit details"
                  >
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expandedRow === i && 'rotate-180')} />
                  </button>
                  <button
                    onClick={() => removeVar(i)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedRow === i && (
                <div className="px-4 pb-3 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Section Label</label>
                      <input
                        value={v.section_label || ''}
                        onChange={e => updateVar(i, { section_label: e.target.value || null })}
                        className="mt-1 text-xs w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400"
                        placeholder="e.g. Social Media Utilisation"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Missing Code</label>
                      <input
                        type="number"
                        value={v.missing_code ?? ''}
                        onChange={e => updateVar(i, { missing_code: e.target.value ? Number(e.target.value) : null })}
                        className="mt-1 text-xs w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400"
                        placeholder="e.g. 99 or 999"
                      />
                    </div>
                    {v.type === 'nominal' && (
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Value Labels (JSON)</label>
                        <textarea
                          value={v.values ? JSON.stringify(v.values) : ''}
                          onChange={e => { try { updateVar(i, { values: JSON.parse(e.target.value) }); } catch {} }}
                          className="mt-1 text-xs w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 font-mono h-16 resize-none"
                          placeholder='{"1":"Male","2":"Female"}'
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Set <strong>IV</strong> (Independent) and <strong>DV</strong> (Dependent) roles to enable correlation, regression, and mediation tests
      </p>
    </div>
  );
}
