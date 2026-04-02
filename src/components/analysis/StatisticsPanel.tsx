import { useState } from 'react';
import { ComputedStats } from '@/types/analysis.types';
import { ChevronDown, ChevronRight, TrendingUp, BarChart3, Activity, TestTube, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsPanelProps {
  stats: ComputedStats;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
          <span className="text-gray-400">{icon}</span>
          {title}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function StatTable({ headers, rows }: { headers: string[]; rows: (string | number | null)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {headers.map(h => <th key={h} className="text-left py-1.5 px-2 font-semibold text-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {row.map((cell, j) => (
                <td key={j} className={cn('py-1.5 px-2 text-gray-700 dark:text-gray-300', j === 0 ? 'font-medium' : 'text-right tabular-nums')}>
                  {cell === null ? '—' : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sig({ p }: { p: number }) {
  const sig = p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : 'ns';
  const color = p < 0.05 ? 'text-green-600' : 'text-gray-400';
  return <span className={cn('font-bold ml-1', color)}>{sig}</span>;
}

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Respondents', value: stats.n_total },
          { label: 'Valid Responses', value: stats.n_valid },
          { label: 'Response Rate', value: `${stats.response_rate}%` },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{m.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tests run badges */}
      <div className="flex flex-wrap gap-1.5">
        {stats.tests_run.map(t => (
          <span key={t} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
            {t.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Descriptive */}
      {stats.descriptive && stats.descriptive.length > 0 && (
        <Section title="Descriptive Statistics" icon={<BarChart3 className="w-4 h-4" />}>
          <StatTable
            headers={['Variable', 'N', 'Mean', 'SD', 'Min', 'Max', 'Skew']}
            rows={stats.descriptive.filter(d => d.type !== 'nominal').map(d => [
              d.label, d.n, d.mean ?? '—', d.std_dev ?? '—', d.min ?? '—', d.max ?? '—', d.skewness ?? '—'
            ])}
          />
        </Section>
      )}

      {/* Normality */}
      {stats.normality && stats.normality.length > 0 && (
        <Section title="Normality Tests" icon={<Activity className="w-4 h-4" />} defaultOpen={false}>
          <StatTable
            headers={['Variable', 'Shapiro-Wilk W', 'S-W p', 'Normal?', 'Skewness', 'Kurtosis']}
            rows={stats.normality.map(n => [
              n.label,
              n.shapiro_wilk?.statistic ?? '—',
              n.shapiro_wilk?.p_value ?? '—',
              n.shapiro_wilk ? (n.shapiro_wilk.normal ? '✓ Yes' : '✗ No') : '—',
              n.skewness,
              n.kurtosis,
            ])}
          />
        </Section>
      )}

      {/* Reliability */}
      {stats.reliability && stats.reliability.length > 0 && (
        <Section title="Reliability Analysis" icon={<TestTube className="w-4 h-4" />}>
          <StatTable
            headers={['Scale', 'N Items', 'N Cases', "Cronbach's α", "McDonald's ω", 'Interpretation']}
            rows={stats.reliability.map(r => [
              r.scale_name, r.n_items, r.n_respondents, r.cronbach_alpha, r.mcdonalds_omega ?? '—', r.interpretation
            ])}
          />
        </Section>
      )}

      {/* Correlation */}
      {stats.correlation && (
        <Section title="Correlation Analysis" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: 'Pearson r', value: stats.correlation.pearson_r },
              { label: 'Spearman ρ', value: stats.correlation.spearman_rho },
              { label: 'p-value', value: stats.correlation.p_value },
              { label: 'Effect Size', value: stats.correlation.effect_size },
            ].map(m => (
              <div key={m.label} className="text-center bg-gray-50 dark:bg-gray-800/40 rounded-lg py-2">
                <p className="font-bold text-gray-800 dark:text-gray-100">{m.value}</p>
                <p className="text-[10px] text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            <strong>{stats.correlation.iv_label}</strong> → <strong>{stats.correlation.dv_label}</strong>:&nbsp;
            {stats.correlation.significant ? '✓ Statistically significant at p < 0.05' : '✗ Not statistically significant'}
          </p>
        </Section>
      )}

      {/* Group Comparisons */}
      {stats.group_comparisons && stats.group_comparisons.length > 0 && (
        <Section title="Group Comparison Tests" icon={<BarChart3 className="w-4 h-4" />} defaultOpen={false}>
          {stats.group_comparisons.map((gc, i) => (
            <div key={i} className="mb-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{gc.test}: <span className="text-blue-600">{gc.dv_label}</span> by <span className="text-blue-600">{gc.group_label}</span></p>
              {'t_statistic' in gc ? (
                <StatTable
                  headers={['Statistic', 't', 'p', "Cohen's d", 'Sig']}
                  rows={[['Result', (gc as any).t_statistic, (gc as any).p_value, (gc as any).cohens_d, (gc as any).significant ? '✓' : '✗']]}
                />
              ) : (
                <StatTable
                  headers={['Statistic', 'F', 'p', 'η²', 'Sig']}
                  rows={[['Result', (gc as any).f_statistic, (gc as any).p_value, (gc as any).eta_squared, (gc as any).significant ? '✓' : '✗']]}
                />
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Regression */}
      {stats.regression && (
        <Section title="Regression Analysis" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'R²', value: stats.regression.r_squared },
              { label: 'Adj. R²', value: stats.regression.adj_r_squared },
              { label: 'F', value: stats.regression.f_statistic },
              { label: 'p(F)', value: stats.regression.f_p_value },
            ].map(m => (
              <div key={m.label} className="text-center bg-gray-50 dark:bg-gray-800/40 rounded-lg py-2">
                <p className="font-bold text-gray-800 dark:text-gray-100">{m.value}</p>
                <p className="text-[10px] text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>
          <StatTable
            headers={['Predictor', 'β', 'SE', 't', 'p', 'Sig']}
            rows={stats.regression.predictors.map(p => [p.label, p.beta, p.std_error, p.t_statistic, p.p_value, p.significant ? '✓' : '✗'])}
          />
        </Section>
      )}

      {/* Mediation */}
      {stats.mediation && (
        <Section title="Mediation Analysis" icon={<GitBranch className="w-4 h-4" />} defaultOpen={false}>
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 font-mono text-xs text-center text-gray-600 dark:text-gray-300 mb-3">
            {stats.mediation.iv_label} →[a={stats.mediation.path_a}]→ {stats.mediation.mediator_label} →[b={stats.mediation.path_b}]→ {stats.mediation.dv_label}
            <br />
            Direct (c'): {stats.mediation.path_c_prime} · Indirect (a×b): {stats.mediation.indirect_effect}
          </div>
          <StatTable
            headers={['Path', 'Coefficient', 'p-value', 'Significant']}
            rows={[
              ['a (IV → Mediator)', stats.mediation.path_a, stats.mediation.path_a_p, stats.mediation.path_a_p < 0.05 ? '✓' : '✗'],
              ['b (Mediator → DV)', stats.mediation.path_b, '—', '—'],
              ['c (Total effect)', stats.mediation.path_c, stats.mediation.path_c_p, stats.mediation.path_c_p < 0.05 ? '✓' : '✗'],
              ["c' (Direct effect)", stats.mediation.path_c_prime, '—', '—'],
              ['Indirect (a×b)', stats.mediation.indirect_effect, '—', '—'],
            ]}
          />
          <p className="text-xs text-center mt-2 font-semibold text-gray-600 dark:text-gray-300">
            Mediation Type: <span className="text-blue-600">{stats.mediation.mediation_type}</span>
          </p>
        </Section>
      )}
    </div>
  );
}
