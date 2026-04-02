import { AnalysisConfig, StatTest, AnalysisMode } from '@/types/analysis.types';
import { Zap, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisSelectorProps {
  config: AnalysisConfig;
  onModeChange: (mode: AnalysisMode) => void;
  onToggleTest: (test: StatTest) => void;
}

const TEST_GROUPS: { label: string; color: string; tests: { id: StatTest; label: string; desc: string }[] }[] = [
  {
    label: 'Descriptive & Normality',
    color: 'blue',
    tests: [
      { id: 'descriptive', label: 'Descriptive Statistics', desc: 'Mean, SD, frequencies, skewness, kurtosis' },
      { id: 'normality', label: 'Normality Tests', desc: 'Shapiro-Wilk, Kolmogorov-Smirnov' },
      { id: 'section_stats', label: 'Section Descriptives', desc: 'Likert scale group means and SDs' },
    ],
  },
  {
    label: 'Reliability',
    color: 'purple',
    tests: [
      { id: 'reliability', label: "Cronbach's Alpha / McDonald's ω", desc: 'Scale reliability for ordinal/Likert items' },
    ],
  },
  {
    label: 'Correlation',
    color: 'green',
    tests: [
      { id: 'correlation', label: 'IV–DV Correlation', desc: 'Pearson r and Spearman ρ between IV and DV' },
      { id: 'correlation_matrix', label: 'Correlation Matrix', desc: 'All-variable pairwise correlations' },
    ],
  },
  {
    label: 'Group Comparison',
    color: 'orange',
    tests: [
      { id: 'ttest', label: 'Independent Samples t-Test', desc: '2-group mean comparison + Mann-Whitney U' },
      { id: 'anova', label: 'One-Way ANOVA', desc: '3+ group comparison + Kruskal-Wallis H + Tukey post-hoc' },
      { id: 'chi_square', label: 'Chi-Square / Fisher\'s Exact', desc: 'Categorical variable association' },
    ],
  },
  {
    label: 'Regression',
    color: 'red',
    tests: [
      { id: 'regression', label: 'Linear Regression', desc: 'Simple or multiple regression (scale DV)' },
      { id: 'logistic_regression', label: 'Logistic Regression', desc: 'Binary/categorical DV — odds ratios' },
    ],
  },
  {
    label: 'Multivariate',
    color: 'indigo',
    tests: [
      { id: 'factor_analysis', label: 'Exploratory Factor Analysis (EFA)', desc: 'Varimax rotation, eigenvalues, factor loadings' },
    ],
  },
  {
    label: 'Mediation & Moderation',
    color: 'pink',
    tests: [
      { id: 'mediation', label: 'Mediation Analysis', desc: 'Baron & Kenny paths (a, b, c, c\') + indirect effect' },
      { id: 'moderation', label: 'Moderation Analysis', desc: 'Interaction effect (IV × Moderator → DV)' },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 text-blue-700',
  purple: 'border-purple-200 bg-purple-50 dark:bg-purple-900/10 text-purple-700',
  green: 'border-green-200 bg-green-50 dark:bg-green-900/10 text-green-700',
  orange: 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 text-orange-700',
  red: 'border-red-200 bg-red-50 dark:bg-red-900/10 text-red-700',
  indigo: 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700',
  pink: 'border-pink-200 bg-pink-50 dark:bg-pink-900/10 text-pink-700',
};

export function AnalysisSelector({ config, onModeChange, onToggleTest }: AnalysisSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange('auto')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
            config.mode === 'auto'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.mode === 'auto' ? 'bg-blue-100' : 'bg-gray-100 dark:bg-gray-800')}>
            <Zap className={cn('w-5 h-5', config.mode === 'auto' ? 'text-blue-600' : 'text-gray-400')} />
          </div>
          <div className="text-center">
            <p className={cn('font-semibold text-sm', config.mode === 'auto' ? 'text-blue-700' : 'text-gray-600 dark:text-gray-300')}>Auto Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Engine selects the right tests based on your data</p>
          </div>
          {config.mode === 'auto' && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">RECOMMENDED</span>}
        </button>

        <button
          onClick={() => onModeChange('manual')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
            config.mode === 'manual'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.mode === 'manual' ? 'bg-indigo-100' : 'bg-gray-100 dark:bg-gray-800')}>
            <SlidersHorizontal className={cn('w-5 h-5', config.mode === 'manual' ? 'text-indigo-600' : 'text-gray-400')} />
          </div>
          <div className="text-center">
            <p className={cn('font-semibold text-sm', config.mode === 'manual' ? 'text-indigo-700' : 'text-gray-600 dark:text-gray-300')}>Manual Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Select exactly which tests to run</p>
          </div>
        </button>
      </div>

      {/* Auto mode info */}
      {config.mode === 'auto' && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Auto Mode:</strong> The engine reads your codebook (variable types and roles), checks normality, and automatically runs all statistically appropriate tests for your data.
        </div>
      )}

      {/* Manual test selection */}
      {config.mode === 'manual' && (
        <div className="space-y-4">
          {TEST_GROUPS.map(group => (
            <div key={group.label} className={cn('border rounded-xl overflow-hidden', colorMap[group.color])}>
              <div className="px-4 py-2 font-semibold text-xs uppercase tracking-widest border-b border-current/20">
                {group.label}
              </div>
              <div className="divide-y divide-current/10">
                {group.tests.map(test => {
                  const checked = config.selected_tests.includes(test.id);
                  return (
                    <button
                      key={test.id}
                      onClick={() => onToggleTest(test.id)}
                      className={cn('w-full flex items-start gap-3 px-4 py-3 text-left transition-all', checked ? 'bg-white/60 dark:bg-white/5' : 'hover:bg-white/40 dark:hover:bg-white/5')}
                    >
                      <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all', checked ? 'bg-current border-current' : 'border-current/40')}>
                        {checked && <Check className="w-3 h-3 text-white dark:text-gray-900" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{test.label}</p>
                        <p className="text-xs opacity-60 mt-0.5">{test.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center">{config.selected_tests.length} test{config.selected_tests.length !== 1 ? 's' : ''} selected</p>
        </div>
      )}
    </div>
  );
}
