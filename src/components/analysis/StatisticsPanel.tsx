import { useState } from 'react';
import {
  ComputedStats, DescriptiveStats, NormalityTest, ReliabilityResult,
  SectionStats, CorrelationResult, CorrelationMatrix,
  TTestResult, AnovaResult, ChiSquareResult, RegressionResult,
  LogisticRegressionResult, MediationResult, ModerationResult,
} from '@/types/analysis.types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Primitive helpers ────────────────────────────────────────────────────────

const fmt = (v: number | null | undefined, dec = 3): string =>
  v == null ? '—' : Number(v).toFixed(dec);

const sigStars = (p: number | null | undefined): string => {
  if (p == null) return '';
  if (p < 0.001) return '***';
  if (p < 0.01)  return '**';
  if (p < 0.05)  return '*';
  return 'ns';
};

const sigCls = (p: number | null | undefined): string =>
  p != null && p < 0.05
    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
    : 'text-gray-400';

function SigCell({ p }: { p: number | null | undefined }) {
  return (
    <span className={sigCls(p)}>
      {fmt(p, 4)} {sigStars(p)}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  const map: Record<string, string> = {
    excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    good: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    acceptable: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    questionable: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    unacceptable: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    large: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    moderate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    small: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    negligible: 'bg-gray-100 text-gray-500',
    strong: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    weak: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  };
  const key = (label ?? '').toLowerCase();
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', map[key] ?? 'bg-gray-100 text-gray-500')}>
      {label}
    </span>
  );
}

function MiniBar({ pct }: { pct: number }) {
  const color = pct > 50 ? 'bg-blue-500' : pct > 25 ? 'bg-blue-400' : 'bg-blue-300';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden min-w-[50px]">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-[10px] tabular-nums text-gray-400 w-9 text-right">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── Plain-English helpers ────────────────────────────────────────────────────

function likertLabel(mean: number | null | undefined): string {
  if (mean == null) return '—';
  if (mean >= 3.50) return 'Strong Agreement';
  if (mean >= 2.50) return 'General Agreement';
  if (mean >= 1.50) return 'General Disagreement';
  return 'Strong Disagreement';
}

function corrStrength(r: number | null | undefined): string {
  if (r == null) return 'unknown';
  const abs = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  if (abs >= 0.9) return `very strong ${dir}`;
  if (abs >= 0.7) return `strong ${dir}`;
  if (abs >= 0.5) return `moderate ${dir}`;
  if (abs >= 0.3) return `weak ${dir}`;
  return `negligible ${dir}`;
}

function alphaPlain(alpha: number, interp: string): string {
  if (interp === 'Excellent' || interp === 'Good') return 'The survey items are highly consistent — they reliably measure the same concept.';
  if (interp === 'Acceptable') return 'The survey items are sufficiently consistent for research purposes.';
  if (interp === 'Questionable') return 'The survey items show some inconsistency — results should be interpreted with caution.';
  return 'The survey items are poorly consistent — the scale may need revision.';
}

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-4 flex gap-2.5 items-start bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl px-3.5 py-2.5">
      <span className="text-base mt-0.5 shrink-0">💡</span>
      <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Collapsible section wrapper ─────────────────────────────────────────────

function Collapsible({
  title, sub, children, open: defaultOpen = true,
}: { title: string; sub?: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</p>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="border-t border-gray-100 dark:border-gray-800">{children}</div>}
    </div>
  );
}

// ─── Generic academic table ───────────────────────────────────────────────────

type ColDef = { label: string; align?: 'left' | 'right' | 'center' };
type RowDef = { cells: (string | number | React.ReactNode | null)[]; highlight?: boolean };

function AcaTable({ cols, rows, note }: { cols: ColDef[]; rows: RowDef[]; note?: string }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              {cols.map((c, i) => (
                <th
                  key={i}
                  className={cn(
                    'py-2 px-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px] whitespace-nowrap',
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  'hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors',
                  row.highlight && 'bg-blue-50/40 dark:bg-blue-900/10 font-semibold',
                )}
              >
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      'py-2 px-3 text-gray-700 dark:text-gray-300',
                      ci === 0 ? 'text-left' : 'text-right tabular-nums',
                      cols[ci]?.align === 'center' && 'text-center',
                    )}
                  >
                    {cell ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className="text-[10px] text-gray-400 italic px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          {note}
        </p>
      )}
    </div>
  );
}

// ─── Sub-panels ───────────────────────────────────────────────────────────────

function DescriptivePanel({ data }: { data: DescriptiveStats[] }) {
  const scales  = data.filter(d => d.type === 'scale');
  const ordinal = data.filter(d => d.type === 'ordinal');
  const nominal = data.filter(d => d.type === 'nominal');

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
      {/* Scale */}
      {scales.length > 0 && (
        <div className="p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Continuous / Scale Variables</p>
          <AcaTable
            cols={[
              { label: 'Variable' },
              { label: 'N', align: 'right' },
              { label: 'Missing', align: 'right' },
              { label: 'Mean', align: 'right' },
              { label: 'Std. Dev', align: 'right' },
              { label: 'Min', align: 'right' },
              { label: 'Max', align: 'right' },
              { label: 'Skewness', align: 'right' },
              { label: 'Kurtosis', align: 'right' },
            ]}
            rows={scales.map(d => ({
              cells: [
                d.label || d.variable, d.n, d.missing ?? 0,
                fmt(d.mean, 2), fmt(d.std_dev, 3),
                fmt(d.min, 2), fmt(d.max, 2),
                fmt(d.skewness, 3), fmt(d.kurtosis, 3),
              ],
            }))}
            note="Skewness / Kurtosis between −2 and +2 indicate approximate normality."
          />
        </div>
      )}

      {/* Ordinal summary */}
      {ordinal.length > 0 && (
        <div className="p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ordinal / Likert Items — Overall Summary</p>
          <AcaTable
            cols={[
              { label: 'Variable' },
              { label: 'N', align: 'right' },
              { label: 'Mean (x̄)', align: 'right' },
              { label: 'Std. Dev', align: 'right' },
              { label: 'Min', align: 'right' },
              { label: 'Max', align: 'right' },
            ]}
            rows={[
              ...ordinal.map(d => ({
                cells: [d.label || d.variable, d.n, fmt(d.mean, 2), fmt(d.std_dev, 3), fmt(d.min, 0), fmt(d.max, 0)],
              })),
              {
                highlight: true,
                cells: [
                  'Grand Mean (all items)',
                  '',
                  fmt(ordinal.reduce((s, d) => s + (d.mean ?? 0), 0) / ordinal.length, 2),
                  fmt(ordinal.reduce((s, d) => s + (d.std_dev ?? 0), 0) / ordinal.length, 3),
                  '', '',
                ],
              },
            ]}
            note="Decision Rule (4-point Likert): 1.00–1.49 = Strongly Disagree · 1.50–2.49 = Disagree · 2.50–3.49 = Agree · 3.50–4.00 = Strongly Agree"
          />
        </div>
      )}

      {/* Nominal frequency tables */}
      {nominal.length > 0 && (
        <div className="p-5 space-y-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Demographic / Categorical Variables</p>
          {nominal.map(d => {
            const freqs = d.frequencies || {};
            const pcts  = d.percentages  || {};
            const labels = d.value_labels || {};
            const total = Object.values(freqs).reduce((s: number, v: any) => s + Number(v), 0);
            let cumulative = 0;
            return (
              <div key={d.variable} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800/40 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{d.label || d.variable}</span>
                  <span className="text-[11px] text-gray-400">N = {d.n}</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Category', 'Frequency', '%', 'Cumulative %', 'Distribution'].map(h => (
                        <th key={h} className="py-1.5 px-3 text-[10px] font-bold text-gray-400 uppercase text-left first:text-left last:text-left [&:not(:first-child)]:text-right [&:last-child]:text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/20">
                    {Object.entries(freqs).map(([k, f]: any) => {
                      const pct = pcts[k] != null ? Number(pcts[k]) : (f / (total || 1)) * 100;
                      cumulative += pct;
                      return (
                        <tr key={k} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                          <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{labels[k] || k}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-600 dark:text-gray-400">{f}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-600 dark:text-gray-400">{pct.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-500">{cumulative.toFixed(1)}</td>
                          <td className="py-2 px-3"><MiniBar pct={pct} /></td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50/50 dark:bg-gray-800/20 font-semibold">
                      <td className="py-1.5 px-3 text-gray-600 dark:text-gray-300">Total</td>
                      <td className="py-1.5 px-3 text-right tabular-nums">{total}</td>
                      <td className="py-1.5 px-3 text-right">100.0</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SectionPanel({ sections }: { sections: Record<string, SectionStats> }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
      {Object.entries(sections).map(([key, sec]) => {
        const topItem = [...sec.variables].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0))[0];
        const bottomItem = [...sec.variables].sort((a, b) => (a.mean ?? 0) - (b.mean ?? 0))[0];
        return (
          <div key={key}>
            <div className="p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{sec.section_name || key}</p>
                <span className="text-[11px] text-gray-400">
                  Section Mean = <strong className="text-blue-600 dark:text-blue-400">{fmt(sec.section_mean, 2)}</strong>
                  &nbsp;·&nbsp;SD = {fmt(sec.section_std, 3)}
                </span>
              </div>
              <AcaTable
                cols={[
                  { label: 'Item' },
                  { label: 'N', align: 'right' },
                  { label: 'Mean (x̄)', align: 'right' },
                  { label: 'Std. Dev', align: 'right' },
                  { label: 'Response Level', align: 'left' },
                ]}
                rows={[
                  ...sec.variables.map(v => ({
                    cells: [
                      v.label || v.variable,
                      v.n,
                      fmt(v.mean, 2),
                      fmt(v.std_dev, 3),
                      <span className={cn('text-[10px] font-semibold',
                        (v.mean ?? 0) >= 3.5 ? 'text-emerald-600' : (v.mean ?? 0) >= 2.5 ? 'text-blue-600' : 'text-red-500'
                      )}>{likertLabel(v.mean)}</span>,
                    ],
                  })),
                  {
                    highlight: true,
                    cells: ['Section Average', '', fmt(sec.section_mean, 2), fmt(sec.section_std, 3), likertLabel(sec.section_mean)],
                  },
                ]}
                note="Decision Rule (4-point Likert): 1.00–1.49 = Strongly Disagree · 1.50–2.49 = Disagree · 2.50–3.49 = Agree · 3.50–4.00 = Strongly Agree"
              />
            </div>
            <Insight>
              Overall, respondents showed <strong>{likertLabel(sec.section_mean).toLowerCase()}</strong> for items in <strong>{sec.section_name || key}</strong> (x̄ = {fmt(sec.section_mean, 2)}, SD = {fmt(sec.section_std, 3)}).
              {topItem && <> The highest-rated item was &ldquo;<em>{topItem.label || topItem.variable}</em>&rdquo; (x̄ = {fmt(topItem.mean, 2)}){bottomItem && topItem.variable !== bottomItem.variable ? <>, while the lowest was &ldquo;<em>{bottomItem.label || bottomItem.variable}</em>&rdquo; (x̄ = {fmt(bottomItem.mean, 2)})</> : null}.</>}
            </Insight>
          </div>
        );
      })}
    </div>
  );
}

function NormalityPanel({ data }: { data: NormalityTest[] }) {
  const normalCount = data.filter(n => n.shapiro_wilk?.normal).length;
  const allNormal = normalCount === data.length;
  const majority = normalCount >= data.length / 2;
  return (
    <div>
      <div className="p-5">
        <AcaTable
          cols={[
            { label: 'Variable' },
            { label: 'S-W Statistic', align: 'right' },
            { label: 'S-W p', align: 'right' },
            { label: 'K-S p', align: 'right' },
            { label: 'Normal?', align: 'center' },
            { label: 'Skewness', align: 'right' },
            { label: 'Kurtosis', align: 'right' },
          ]}
          rows={data.map(n => ({
            cells: [
              n.label || n.variable,
              n.shapiro_wilk ? fmt(n.shapiro_wilk.statistic, 4) : '—',
              n.shapiro_wilk ? <SigCell p={n.shapiro_wilk.p_value} /> : '—',
              <SigCell p={n.kolmogorov_smirnov?.p_value} />,
              n.shapiro_wilk?.normal
                ? <span className="text-emerald-600 font-bold">✓ Yes</span>
                : <span className="text-red-500 font-bold">✗ No</span>,
              fmt(n.skewness, 3),
              fmt(n.kurtosis, 3),
            ],
          }))}
          note="p > .05 = normality assumption met.  * p<.05  ** p<.01  *** p<.001"
        />
      </div>
      <Insight>
        {allNormal
          ? <>All {data.length} variable{data.length > 1 ? 's' : ''} follow a normal distribution. <strong>Standard (parametric) statistical tests such as t-tests, ANOVA, and Pearson correlation are appropriate</strong> for this data.</>  
          : majority
            ? <>{normalCount} of {data.length} variables are normally distributed. <strong>Parametric tests can be used with caution</strong>, but non-parametric alternatives (e.g., Mann-Whitney, Kruskal-Wallis) have also been reported alongside for safety.</>
            : <>Most variables do not follow a normal distribution. <strong>Non-parametric test results (e.g., Mann-Whitney U, Kruskal-Wallis H) should be prioritised</strong> when interpreting group comparisons.</>}
      </Insight>
    </div>
  );
}

function ReliabilityPanel({ data }: { data: ReliabilityResult[] }) {
  return (
    <div>
      <div className="p-5">
        <AcaTable
          cols={[
            { label: 'Scale' },
            { label: 'Items', align: 'right' },
            { label: 'N', align: 'right' },
            { label: "Cronbach's α", align: 'right' },
            { label: "McDonald's ω", align: 'right' },
            { label: 'Interpretation', align: 'center' },
          ]}
          rows={data.map(r => ({
            cells: [
              r.scale_name, r.n_items, r.n_respondents,
              <span className="font-mono font-bold">{fmt(r.cronbach_alpha, 3)}</span>,
              r.mcdonalds_omega != null ? <span className="font-mono">{fmt(r.mcdonalds_omega, 3)}</span> : '—',
              <Badge label={r.interpretation} />,
            ],
          }))}
          note="α ≥ .90 = Excellent · α ≥ .80 = Good · α ≥ .70 = Acceptable · α ≥ .60 = Questionable · α < .60 = Poor"
        />
      </div>
      {data.map(r => (
        <Insight key={r.scale_name}>
          <strong>{r.scale_name}</strong> (α = {fmt(r.cronbach_alpha, 3)} — <em>{r.interpretation}</em>):{' '}
          {alphaPlain(r.cronbach_alpha, r.interpretation)}
        </Insight>
      ))}
    </div>
  );
}

function CorrelationPanel({ corr, matrix }: { corr?: CorrelationResult | null; matrix?: CorrelationMatrix | null }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
      {corr && (
        <div className="p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">IV → DV Correlation</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Pearson r', val: fmt(corr.pearson_r, 3), cls: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Spearman ρ', val: fmt(corr.spearman_rho, 3), cls: 'text-blue-600 dark:text-blue-400' },
              { label: 'p-value', val: `${fmt(corr.p_value, 4)} ${sigStars(corr.p_value)}`, cls: sigCls(corr.p_value) },
              { label: 'Effect Size', val: corr.effect_size, cls: 'text-gray-700 dark:text-gray-300' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-100 dark:border-gray-700">
                <p className={cn('text-base font-bold tabular-nums', m.cls)}>{m.val}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          <div className={cn(
            'flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 border',
            corr.significant
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/40'
              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700',
          )}>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{corr.iv_label}</span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{corr.dv_label}</span>
            <span className={cn('ml-auto font-semibold', corr.significant ? 'text-emerald-600' : 'text-gray-400')}>
              {corr.significant ? '✓ Statistically significant (p < .05)' : '✗ Not statistically significant'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 italic mt-2">N = {corr.n}. ** Significant at 0.01 level (2-tailed).</p>
          <Insight>
            There is a <strong>{corrStrength(corr.pearson_r)}</strong> relationship between <strong>{corr.iv_label}</strong> and <strong>{corr.dv_label}</strong> (r = {fmt(corr.pearson_r, 3)}, p {corr.p_value < 0.001 ? '< .001' : '= ' + fmt(corr.p_value, 3)}).
            {corr.significant
              ? <> This result is <strong>statistically significant</strong> — meaning the relationship is unlikely to be due to chance. In practical terms, as {corr.iv_label} increases, {corr.dv_label} tends to {(corr.pearson_r ?? 0) >= 0 ? 'increase' : 'decrease'} as well.</>
              : <> This result is <strong>not statistically significant</strong> — there is insufficient evidence of a meaningful relationship between these variables.</>}
          </Insight>
        </div>
      )}

      {matrix && matrix.variables?.length > 0 && (
        <div className="p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Correlation Matrix (Pearson r)</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-2 text-left text-[10px] font-bold text-gray-400 uppercase">Variable</th>
                  {matrix.labels.map((_, i) => (
                    <th key={i} className="py-2 px-2 text-center text-[10px] font-bold text-gray-400">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                {matrix.matrix.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="py-1.5 px-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {ri + 1}. {matrix.labels[ri]}
                    </td>
                    {row.map((cell, ci) => {
                      const isdiag = ri === ci;
                      const abs = Math.abs(cell?.r ?? 0);
                      const bg = isdiag ? 'bg-gray-100 dark:bg-gray-800'
                        : abs >= 0.7 ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : abs >= 0.5 ? 'bg-blue-50 dark:bg-blue-900/10'
                        : abs >= 0.3 ? 'bg-gray-50 dark:bg-gray-800/20'
                        : '';
                      const textCls = cell?.p != null && cell.p < 0.05
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-gray-500';
                      return (
                        <td key={ci} className={cn('py-1.5 px-2 text-center tabular-nums', bg)}>
                          {isdiag
                            ? <span className="text-gray-400">1</span>
                            : cell?.r != null
                              ? <span className={textCls}>
                                  {fmt(cell.r, 3)}{cell.p != null && cell.p < 0.01 ? '**' : cell.p != null && cell.p < 0.05 ? '*' : ''}
                                </span>
                              : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 italic mt-2">
            * p &lt; .05 &nbsp;** p &lt; .01. Deeper shading = stronger correlation.
          </p>
          <div className="mt-2 space-y-0.5">
            {matrix.labels.map((l, i) => (
              <p key={i} className="text-[10px] text-gray-400">{i + 1}. {l}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupPanel({ comps }: { comps: Array<TTestResult | AnovaResult> }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
      {comps.filter(Boolean).map((gc, i) => {
        const isTTest = gc.test?.toLowerCase().includes('t-test') || gc.test?.toLowerCase().includes('independent');
        const t = gc as TTestResult;
        const a = gc as AnovaResult;
        return (
          <div key={i} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{gc.test}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Group: <strong>{gc.group_label}</strong> · DV: <strong>{gc.dv_label}</strong>
                </p>
              </div>
              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', gc.significant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500')}>
                {gc.significant ? '✓ Significant' : 'Not Significant'}
              </span>
            </div>

            {/* Group means */}
            {gc.groups && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {Object.entries(gc.groups).map(([k, g]) => (
                  <div key={k} className="bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3 py-2 text-center border border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{fmt(g.mean, 2)}</p>
                    <p className="text-[10px] text-gray-400">M (SD = {fmt(g.sd, 3)})</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{k} · n = {g.n}</p>
                  </div>
                ))}
              </div>
            )}

            <AcaTable
              cols={[
                { label: 'Statistic' },
                { label: isTTest ? 'Parametric (t-test)' : 'Parametric (ANOVA)', align: 'right' },
                { label: isTTest ? 'Non-Parametric (Mann-Whitney)' : 'Non-Parametric (Kruskal-Wallis)', align: 'right' },
              ]}
              rows={isTTest ? [
                { cells: ['Test Statistic', `t = ${fmt(t.t_statistic, 3)}`, `U = ${fmt(t.mann_whitney_u, 3)}`] },
                { cells: ['p-value', <SigCell p={t.p_value} />, <SigCell p={t.mann_whitney_p} />] },
                { cells: ['Effect Size', `Cohen's d = ${fmt(t.cohens_d, 3)}`, <Badge label={t.effect_size} />] },
              ] : [
                { cells: ['Test Statistic', `F = ${fmt(a.f_statistic, 3)}`, `H = ${fmt(a.kruskal_wallis_h, 3)}`] },
                { cells: ['p-value', <SigCell p={a.p_value} />, <SigCell p={a.kruskal_wallis_p} />] },
                { cells: ['Effect Size (η²)', fmt(a.eta_squared, 3), <Badge label={a.effect_size} />] },
              ]}
              note={isTTest ? "Cohen's d: < .20 = Negligible · .20 = Small · .50 = Medium · .80 = Large" : "η² < .06 = Small · .06–.14 = Medium · > .14 = Large (Cohen, 1988)"}
            />
            <div className="mt-3">
              <Insight>
                {gc.significant
                  ? <>There <strong>is a statistically significant difference</strong> between groups on <strong>{gc.dv_label}</strong>.
                      The effect size is <strong>{isTTest ? t.effect_size : a.effect_size}</strong>{' '}
                      ({isTTest ? `Cohen's d = ${fmt(t.cohens_d, 3)}` : `η² = ${fmt(a.eta_squared, 3)}`}) —
                      meaning the difference between groups is {(isTTest ? t.effect_size : a.effect_size)?.toLowerCase() === 'large' ? 'practically meaningful' : (isTTest ? t.effect_size : a.effect_size)?.toLowerCase() === 'medium' ? 'moderately meaningful' : 'small but present'}.
                    </>
                  : <>There is <strong>no statistically significant difference</strong> between groups on <strong>{gc.dv_label}</strong>. The variation observed is likely due to chance.</>}
              </Insight>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChiPanel({ data }: { data: ChiSquareResult[] }) {
  return (
    <div className="p-5">
      <AcaTable
        cols={[
          { label: 'Variable 1' },
          { label: 'Variable 2' },
          { label: 'χ²', align: 'right' },
          { label: 'df', align: 'right' },
          { label: 'N', align: 'right' },
          { label: 'p', align: 'right' },
          { label: "Cramér's V", align: 'right' },
          { label: 'Sig.', align: 'center' },
        ]}
        rows={data.filter(Boolean).map(c => ({
          cells: [
            c.col1_label, c.col2_label,
            fmt(c.chi2, 3), c.df, c.n,
            <SigCell p={c.p_value} />,
            fmt(c.cramers_v, 3),
            sigStars(c.p_value),
          ],
        }))}
        note="Cramér's V: < .10 = Negligible · .10–.30 = Small · .30–.50 = Medium · > .50 = Large"
      />
    </div>
  );
}

function RegressionPanel({ reg }: { reg: RegressionResult }) {
  return (
    <div className="p-5 space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{reg.test}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Dependent Variable: <strong>{reg.dv_label}</strong> · N = {reg.n}</p>
      </div>

      {/* Model Summary */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Model Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'R', val: fmt(Math.sqrt(reg.r_squared ?? 0), 3) },
            { label: 'R²', val: fmt(reg.r_squared, 3) },
            { label: 'Adj. R²', val: fmt(reg.adj_r_squared, 3) },
            { label: 'F Statistic', val: fmt(reg.f_statistic, 3) },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums">{m.val}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
        <Insight>
          The predictors in this model explain <strong>{((reg.r_squared ?? 0) * 100).toFixed(1)}%</strong> of the variation in <strong>{reg.dv_label}</strong> (R² = {fmt(reg.r_squared, 3)}).
          {reg.significant
            ? <> The model as a whole is <strong>statistically significant</strong> (F = {fmt(reg.f_statistic, 3)}, p {reg.f_p_value < 0.001 ? '< .001' : '= ' + fmt(reg.f_p_value, 3)}), meaning the predictors collectively have a real effect on the outcome.</>
            : <> The model is <strong>not statistically significant</strong> — the predictors do not reliably explain changes in {reg.dv_label}.</> }
        </Insight>
      </div>

      {/* ANOVA */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">ANOVA — Overall Model Fit</p>
        <AcaTable
          cols={[
            { label: 'Source' },
            { label: 'F', align: 'right' },
            { label: 'p (Sig.)', align: 'right' },
            { label: 'Significant?', align: 'center' },
          ]}
          rows={[{
            cells: [
              'Regression',
              fmt(reg.f_statistic, 3),
              <SigCell p={reg.f_p_value} />,
              reg.significant
                ? <span className="text-emerald-600 font-bold">✓ Yes</span>
                : <span className="text-gray-400">✗ No</span>,
            ],
          }]}
          note={reg.equation ? `Equation: ${reg.equation}` : undefined}
        />
      </div>

      {/* Coefficients */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Coefficients</p>
        <AcaTable
          cols={[
            { label: 'Predictor' },
            { label: 'B (Unstd.)', align: 'right' },
            { label: 'Std. Error', align: 'right' },
            { label: 't', align: 'right' },
            { label: 'Sig.', align: 'right' },
          ]}
          rows={reg.predictors?.map(p => ({
            cells: [
              p.label || p.variable,
              fmt(p.beta, 3),
              fmt(p.std_error, 3),
              fmt(p.t_statistic, 3),
              <SigCell p={p.p_value} />,
            ],
          })) ?? []}
          note="B = unstandardised coefficient. * p < .05  ** p < .01  *** p < .001"
        />
      </div>
    </div>
  );
}

function LogisticPanel({ reg }: { reg: LogisticRegressionResult }) {
  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{reg.test}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          DV: <strong>{reg.dv_label}</strong> · Pseudo R² = {fmt(reg.pseudo_r_squared, 3)} · AIC = {fmt(reg.aic, 2)} · N = {reg.n}
        </p>
      </div>
      <AcaTable
        cols={[
          { label: 'Predictor' },
          { label: 'B (Coef.)', align: 'right' },
          { label: 'Odds Ratio', align: 'right' },
          { label: 'Sig.', align: 'right' },
        ]}
        rows={reg.predictors?.map(p => ({
          cells: [p.label || p.variable, fmt(p.coefficient, 3), fmt(p.odds_ratio, 3), <SigCell p={p.p_value} />],
        })) ?? []}
        note="OR > 1 = increased odds · OR < 1 = decreased odds. * p < .05  ** p < .01  *** p < .001"
      />
    </div>
  );
}

function MediationPanel({ med }: { med: MediationResult }) {
  return (
    <div className="p-5 space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
          <span className="font-bold">{med.iv_label}</span>
          <span className="text-gray-400 mx-2">—[a = {fmt(med.path_a, 3)}]→</span>
          <span className="font-bold">{med.mediator_label}</span>
          <span className="text-gray-400 mx-2">—[b = {fmt(med.path_b, 3)}]→</span>
          <span className="font-bold">{med.dv_label}</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          Direct effect (c') = {fmt(med.path_c_prime, 3)} · Indirect (a × b) = {fmt(med.indirect_effect, 3)}
        </p>
        <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {med.mediation_type} Mediation
        </span>
      </div>
      <AcaTable
        cols={[
          { label: 'Path' },
          { label: 'Coefficient', align: 'right' },
          { label: 'p-value', align: 'right' },
          { label: 'Sig.', align: 'center' },
        ]}
        rows={[
          { cells: ['Path a  (IV → Mediator)', fmt(med.path_a, 3), <SigCell p={med.path_a_p} />, sigStars(med.path_a_p)] },
          { cells: ['Path b  (Mediator → DV)', fmt(med.path_b, 3), '—', '—'] },
          { cells: ['Path c  (Total effect)', fmt(med.path_c, 3), <SigCell p={med.path_c_p} />, sigStars(med.path_c_p)] },
          { cells: ["Path c' (Direct effect)", fmt(med.path_c_prime, 3), '—', '—'] },
          { highlight: true, cells: ['Indirect effect (a × b)', fmt(med.indirect_effect, 3), '—', '—'] },
        ]}
        note={`Baron & Kenny (1986) mediation approach. N = ${med.n}`}
      />
    </div>
  );
}

function ModerationPanel({ mod }: { mod: ModerationResult }) {
  return (
    <div className="p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'R²', val: fmt(mod.r_squared, 3) },
          { label: 'Interaction β', val: fmt(mod.interaction_beta, 3) },
          { label: 'Interaction p', val: `${fmt(mod.interaction_p, 4)} ${sigStars(mod.interaction_p)}` },
          { label: 'Moderation', val: mod.significant ? '✓ Confirmed' : '✗ Not Confirmed' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums">{m.val}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{mod.iv_label}</span>
        <span className="text-gray-400 mx-1.5">×</span>
        <span className="font-semibold">{mod.moderator_label}</span>
        <span className="text-gray-400 mx-1.5">→</span>
        <span className="font-semibold">{mod.dv_label}</span>
        <span className="text-gray-400 ml-2">· N = {mod.n}</span>
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StatisticsPanel({ stats }: { stats: ComputedStats }) {
  return (
    <div className="space-y-3">
      {/* ── KPI banner ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Respondents', val: stats.n_total, cls: 'text-gray-800 dark:text-gray-100' },
          { label: 'Valid Responses',   val: stats.n_valid,  cls: 'text-emerald-600 dark:text-emerald-400' },
          {
            label: 'Response Rate',
            val: `${stats.response_rate}%`,
            cls: stats.response_rate >= 70 ? 'text-emerald-600' : 'text-amber-600',
          },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center">
            <p className={cn('text-2xl font-bold tabular-nums', m.cls)}>{m.val}</p>
            <p className="text-[11px] text-gray-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tests run ── */}
      {stats.tests_run?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stats.tests_run.map(t => (
            <span key={t} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/40 capitalize">
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* ── Significance legend ── */}
      <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 py-2 border border-gray-100 dark:border-gray-800">
        <span>* p &lt; .05</span>
        <span>** p &lt; .01</span>
        <span>*** p &lt; .001</span>
        <span>ns = not significant</span>
        <span className="ml-auto italic">Effect sizes follow Cohen (1988)</span>
      </div>

      {/* ── Sections ── */}
      {stats.descriptive && stats.descriptive.length > 0 && (
        <Collapsible title="Descriptive Statistics" sub={`${stats.descriptive.length} variable${stats.descriptive.length > 1 ? 's' : ''}`} open>
          <DescriptivePanel data={stats.descriptive} />
        </Collapsible>
      )}

      {stats.section_stats && Object.keys(stats.section_stats).length > 0 && (
        <Collapsible title="Section Descriptives" sub="Likert scale groups with section average means" open>
          <SectionPanel sections={stats.section_stats} />
        </Collapsible>
      )}

      {stats.normality && stats.normality.length > 0 && (
        <Collapsible title="Normality Tests" sub="Shapiro-Wilk · Kolmogorov-Smirnov" open={false}>
          <NormalityPanel data={stats.normality} />
        </Collapsible>
      )}

      {stats.reliability && stats.reliability.length > 0 && (
        <Collapsible title="Reliability Analysis" sub="Cronbach's α · McDonald's ω">
          <ReliabilityPanel data={stats.reliability} />
        </Collapsible>
      )}

      {(stats.correlation || (stats.correlation_matrix && stats.correlation_matrix.variables?.length > 0)) && (
        <Collapsible title="Correlation Analysis" sub="Pearson r · Spearman ρ · Matrix">
          <CorrelationPanel corr={stats.correlation} matrix={stats.correlation_matrix} />
        </Collapsible>
      )}

      {stats.chi_square && stats.chi_square.length > 0 && (
        <Collapsible title="Chi-Square Tests" sub="Test of Independence · Cramér's V" open={false}>
          <ChiPanel data={stats.chi_square} />
        </Collapsible>
      )}

      {stats.group_comparisons && stats.group_comparisons.length > 0 && (
        <Collapsible title="Group Comparison Tests" sub="t-test · ANOVA · Mann-Whitney · Kruskal-Wallis" open={false}>
          <GroupPanel comps={stats.group_comparisons} />
        </Collapsible>
      )}

      {stats.regression && (
        <Collapsible title="Regression Analysis" sub={stats.regression.test}>
          <RegressionPanel reg={stats.regression} />
        </Collapsible>
      )}

      {stats.logistic_regression && !(stats.logistic_regression as any).error && (
        <Collapsible title="Logistic Regression" sub="Binary Outcome · Odds Ratios" open={false}>
          <LogisticPanel reg={stats.logistic_regression} />
        </Collapsible>
      )}

      {stats.mediation && (
        <Collapsible title="Mediation Analysis" sub="Baron & Kenny Paths · Indirect Effect" open={false}>
          <MediationPanel med={stats.mediation} />
        </Collapsible>
      )}

      {stats.moderation && (
        <Collapsible title="Moderation Analysis" sub="Interaction Effect (IV × Moderator → DV)" open={false}>
          <ModerationPanel mod={stats.moderation} />
        </Collapsible>
      )}
    </div>
  );
}
