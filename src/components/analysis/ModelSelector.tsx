import { cn } from '@/lib/utils';

const MODELS = [
  { id: 'Gemini',   label: 'Gemini',    provider: 'Google',    color: 'blue'   },
  { id: 'OpenAI',   label: 'GPT-4o',    provider: 'OpenAI',    color: 'green'  },
  { id: 'Claude',   label: 'Claude',    provider: 'Anthropic', color: 'orange' },
  { id: 'Grok',     label: 'Grok',      provider: 'xAI',       color: 'purple' },
  { id: 'DeepSeek', label: 'DeepSeek',  provider: 'DeepSeek',  color: 'indigo' },
];

const colorMap: Record<string, { active: string; dot: string }> = {
  blue:   { active: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',     dot: 'bg-blue-500'   },
  green:  { active: 'border-green-500 bg-green-50 dark:bg-green-900/20',   dot: 'bg-green-500'  },
  orange: { active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20', dot: 'bg-orange-500' },
  purple: { active: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20', dot: 'bg-purple-500' },
  indigo: { active: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', dot: 'bg-indigo-500' },
};

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  // Pre-select from localStorage on first render
  const currentProvider = localStorage.getItem('apiProvider') || 'Gemini';
  const effective = value || currentProvider;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          AI Model for Narrative Generation
        </label>
        <p className="text-xs text-gray-400 mt-0.5">
          Uses the API key you configured in Settings. The model writes Chapter 4 & 5 using only the computed statistics — it never calculates numbers.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {MODELS.map((m) => {
          const isActive = effective === m.id;
          const colors = colorMap[m.color];
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 hover:shadow-sm active:scale-95',
                isActive ? colors.active : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div className={cn('w-2.5 h-2.5 rounded-full', isActive ? colors.dot : 'bg-gray-300 dark:bg-gray-600')} />
              <span className={cn('font-bold text-sm', isActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400')}>
                {m.label}
              </span>
              <span className="text-[10px] text-gray-400">{m.provider}</span>
            </button>
          );
        })}
      </div>
      {!localStorage.getItem('apiKey') && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
          ⚠️ No API key found. Go to <strong>Settings</strong> to add your API key before running the analysis.
        </p>
      )}
    </div>
  );
}
