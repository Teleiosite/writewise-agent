import { ResearchContext } from '@/types/analysis.types';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContextFormProps {
  context: ResearchContext;
  onChange: (context: ResearchContext) => void;
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</label>
      {note && <p className="text-xs text-gray-400 mt-0.5 mb-1.5">{note}</p>}
      {!note && <div className="mb-1.5" />}
      {children}
    </div>
  );
}

const inputCls = "w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all placeholder:text-gray-300";
const textareaCls = inputCls + " resize-none";

export function ContextForm({ context, onChange }: ContextFormProps) {
  const update = (patch: Partial<ResearchContext>) => onChange({ ...context, ...patch });

  const updateList = (key: 'objectives' | 'research_questions', i: number, val: string) => {
    const next = [...context[key]];
    next[i] = val;
    update({ [key]: next });
  };
  const addItem = (key: 'objectives' | 'research_questions') => update({ [key]: [...context[key], ''] });
  const removeItem = (key: 'objectives' | 'research_questions', i: number) =>
    update({ [key]: context[key].filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Research Title" note="The title of your project or thesis">
          <input
            value={context.title}
            onChange={e => update({ title: e.target.value })}
            className={inputCls}
            placeholder="e.g. The Impact of Social Media on Student Academic Performance"
          />
        </Field>
        <Field label="Institution" note="University or organization (optional)">
          <input
            value={context.institution || ''}
            onChange={e => update({ institution: e.target.value || null })}
            className={inputCls}
            placeholder="e.g. University of Lagos"
          />
        </Field>
      </div>

      <Field label="Research Objectives" note="List each objective separately — the AI will address each one in Chapter 5">
        <div className="space-y-2">
          {context.objectives.map((obj, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs font-bold text-gray-400 mt-3 w-5 shrink-0">{i + 1}.</span>
              <input
                value={obj}
                onChange={e => updateList('objectives', i, e.target.value)}
                className={inputCls}
                placeholder={`Objective ${i + 1}`}
              />
              {context.objectives.length > 1 && (
                <button onClick={() => removeItem('objectives', i)} className="mt-2.5 text-gray-300 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => addItem('objectives')} className="gap-1.5 text-xs text-blue-600 pl-6">
            <Plus className="w-3.5 h-3.5" /> Add objective
          </Button>
        </div>
      </Field>

      <Field label="Research Questions" note="Each question will get a dedicated table and interpretation in Chapter 4">
        <div className="space-y-2">
          {context.research_questions.map((rq, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs font-bold text-gray-400 mt-3 w-5 shrink-0">RQ{i + 1}</span>
              <input
                value={rq}
                onChange={e => updateList('research_questions', i, e.target.value)}
                className={inputCls}
                placeholder={`Research Question ${i + 1}`}
              />
              {context.research_questions.length > 1 && (
                <button onClick={() => removeItem('research_questions', i)} className="mt-2.5 text-gray-300 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => addItem('research_questions')} className="gap-1.5 text-xs text-blue-600 pl-6">
            <Plus className="w-3.5 h-3.5" /> Add research question
          </Button>
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Hypothesis (optional)">
          <textarea
            value={context.hypothesis || ''}
            onChange={e => update({ hypothesis: e.target.value || null })}
            className={textareaCls}
            rows={3}
            placeholder="e.g. H1: There is a significant relationship between social media usage and academic performance"
          />
        </Field>
        <Field label="Theoretical Framework (optional)">
          <textarea
            value={context.theoretical_framework || ''}
            onChange={e => update({ theoretical_framework: e.target.value || null })}
            className={textareaCls}
            rows={3}
            placeholder="e.g. Technology Acceptance Model (TAM), Social Learning Theory"
          />
        </Field>
      </div>

      <p className="text-xs text-gray-400 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl py-2 px-3">
        All fields are optional. The more context you provide, the more specific and academically rigorous the AI narrative will be.
      </p>
    </div>
  );
}
