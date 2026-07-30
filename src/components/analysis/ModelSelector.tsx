import { cn } from '@/lib/utils';

const MODELS = [
  { id: 'Gemini',   label: 'Gemini',    provider: 'Google'    },
  { id: 'OpenAI',   label: 'GPT-4o',    provider: 'OpenAI'    },
  { id: 'Claude',   label: 'Claude',    provider: 'Anthropic' },
  { id: 'Grok',     label: 'Grok',      provider: 'xAI'       },
  { id: 'DeepSeek', label: 'DeepSeek',  provider: 'DeepSeek'  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const currentProvider = localStorage.getItem('apiProvider') || 'Gemini';
  const effective = value || currentProvider;

  return (
    <div className="space-y-3 font-sans">
      <div>
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
          AI Engine Selection
        </label>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Interprets pre-calculated Python statistics only — LLM never calculates numbers.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 font-mono">
        {MODELS.map((m) => {
          const isActive = effective === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-none border transition-all duration-150 active:scale-95',
                isActive 
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold' 
                  : 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-zinc-800 hover:border-black dark:hover:border-white'
              )}
            >
              <div className={cn('w-2 h-2 rounded-none border', isActive ? 'bg-white border-white dark:bg-black dark:border-black' : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400')} />
              <span className="font-bold text-xs uppercase tracking-wider">
                {m.label}
              </span>
              <span className={cn("text-[10px]", isActive ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500")}>{m.provider}</span>
            </button>
          );
        })}
      </div>
      {!localStorage.getItem('apiKey') && (
        <p className="text-xs font-mono text-black dark:text-white bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-zinc-800 rounded-none px-3 py-2">
          ⚠️ No API key set. Add key in <strong>Settings</strong> before executing narrative streaming.
        </p>
      )}
    </div>
  );
}
