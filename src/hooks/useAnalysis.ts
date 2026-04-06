import { useState, useCallback, useRef } from 'react';
import { 
  CodebookVariable, ResearchContext, AnalysisConfig, 
  ComputedStats, AnalysisStage, AnalysisStatus, StatTest 
} from '../types/analysis.types';
import {
  computeStatistics, detectCodebook, generateNarrative,
  generateSyntax, saveAnalysis, parseExcelFile, parseSavFile
} from '../services/analysisService';
import { toast } from 'sonner';

interface AnalysisState {
  // Stage
  stage: AnalysisStage;
  status: AnalysisStatus;
  progress: number; // 0-100
  progressLabel: string;
  // Data
  rawData: Record<string, unknown>[];
  headers: string[];
  filename: string;
  codebook: CodebookVariable[];
  context: ResearchContext;
  config: AnalysisConfig;
  // Results
  computedStats: ComputedStats | null;
  narrative: string;
  syntax: string;
  isSaved: boolean;
  savedId: string | null;
  // Error
  error: string | null;
}

const DEFAULT_CONTEXT: ResearchContext = {
  title: '',
  institution: null,
  objectives: [''],
  research_questions: [''],
  hypothesis: null,
  theoretical_framework: null,
  writing_sample: null,
};


const DEFAULT_CONFIG: AnalysisConfig = {
  mode: 'auto',
  selected_tests: [],
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    stage: 'upload',
    status: 'idle',
    progress: 0,
    progressLabel: '',
    rawData: [],
    headers: [],
    filename: '',
    codebook: [],
    context: DEFAULT_CONTEXT,
    config: DEFAULT_CONFIG,
    computedStats: null,
    narrative: '',
    syntax: '',
    isSaved: false,
    savedId: null,
    error: null,
  });

  const narrativeRef = useRef('');
  const abortRef = useRef(false);

  const update = useCallback((patch: Partial<AnalysisState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // ─── Stage 1: File Upload ────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (file: File) => {
    update({ status: 'parsing', progress: 10, progressLabel: 'Parsing file...', error: null });
    try {
      let data: Record<string, unknown>[];
      let headers: string[];
      let autoCodebook: CodebookVariable[] = [];

      if (file.name.endsWith('.sav')) {
        // SPSS: send to Python microservice
        update({ progressLabel: 'Sending .sav to statistics engine...' });
        const result = await parseSavFile(file);
        data = result.data;
        headers = result.headers;
        autoCodebook = result.codebook;
      } else {
        // Excel/CSV: parse client-side with SheetJS
        const result = await parseExcelFile(file);
        data = result.data;
        headers = result.headers;
      }

      update({
        rawData: data,
        headers,
        filename: file.name,
        codebook: autoCodebook,
        status: 'detecting',
        progress: 30,
        progressLabel: autoCodebook.length ? 'Codebook loaded from .sav metadata...' : 'Detecting variable types with AI...',
      });

      // Auto-detect codebook if not already from .sav
      if (!autoCodebook.length) {
        const detected = await detectCodebook(headers, data);
        update({ codebook: detected });
      }

      update({ stage: 'codebook', status: 'idle', progress: 0, progressLabel: '' });
      toast.success(`File parsed: ${data.length} rows, ${headers.length} variables`);
    } catch (err: any) {
      update({ status: 'error', error: err.message, progressLabel: '' });
      toast.error(err.message);
    }
  }, [update]);

  // ─── Stage 2: Update Codebook ────────────────────────────────────────────
  const updateCodebook = useCallback((codebook: CodebookVariable[]) => {
    update({ codebook });
  }, [update]);

  const goToContext = useCallback(() => {
    update({ stage: 'context' });
  }, [update]);

  // ─── Stage 3: Update Context ─────────────────────────────────────────────
  const updateContext = useCallback((context: ResearchContext) => {
    update({ context });
  }, [update]);

  const goToConfigure = useCallback(() => {
    update({ stage: 'configure' });
  }, [update]);

  // ─── Stage 4: Update Config ──────────────────────────────────────────────
  const updateConfig = useCallback((config: AnalysisConfig) => {
    update({ config });
  }, [update]);

  // ─── Stage 4 → 5: Run Full Analysis ─────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    abortRef.current = false;
    narrativeRef.current = '';

    // Build a step-by-step message queue based on selected tests
    const tests = state.config.selected_tests.length
      ? state.config.selected_tests
      : ['descriptive', 'normality', 'reliability', 'correlation', 'regression'];

    const stepMessages: { label: string; progress: number }[] = [
      { label: '🔗 Connecting to statistics engine...', progress: 5 },
      { label: '📥 Uploading dataset for processing...', progress: 10 },
    ];

    // Dynamically build steps from selected tests
    const testStepMap: Record<string, { label: string; progress: number }> = {
      descriptive:        { label: '📊 Running descriptive statistics (Mean, SD, frequencies)...', progress: 18 },
      normality:          { label: '📐 Testing normality (Shapiro-Wilk, Kolmogorov-Smirnov)...', progress: 22 },
      reliability:        { label: "🔁 Checking reliability — computing Cronbach's α & McDonald's ω...", progress: 26 },
      section_stats:      { label: '📋 Summarising section averages for Likert scales...', progress: 28 },
      correlation:        { label: '🔗 Computing Pearson & Spearman correlations...', progress: 30 },
      correlation_matrix: { label: '🗂️ Building full correlation matrix...', progress: 33 },
      ttest:              { label: '⚖️ Running Independent Samples t-test & Mann-Whitney U...', progress: 35 },
      anova:              { label: '📈 Running One-Way ANOVA & Kruskal-Wallis H...', progress: 37 },
      chi_square:         { label: '🔢 Running Chi-Square test of independence...', progress: 39 },
      regression:         { label: "📉 Running linear regression — computing R², F, and β coefficients...", progress: 32 },
      logistic_regression:{ label: '📉 Running logistic regression — computing odds ratios...', progress: 34 },
      factor_analysis:    { label: '🧩 Running factor analysis (EFA) with varimax rotation...', progress: 36 },
      mediation:          { label: '🔀 Computing Baron & Kenny mediation paths (a, b, c, c′)...', progress: 38 },
      moderation:         { label: '⚡ Computing moderation — testing interaction effect (IV × Moderator)...', progress: 39 },
    };

    tests.forEach(t => {
      if (testStepMap[t]) stepMessages.push(testStepMap[t]);
    });

    stepMessages.push({ label: '🧮 Finalising statistical results...', progress: 38 });

    // Start cycling through messages while engine computes
    update({
      stage: 'results',
      status: 'computing',
      progress: stepMessages[0].progress,
      progressLabel: stepMessages[0].label,
      narrative: '',
      syntax: '',
      computedStats: null,
      error: null,
    });

    let stepIndex = 0;
    const ticker = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, stepMessages.length - 1);
      update({
        progress: stepMessages[stepIndex].progress,
        progressLabel: stepMessages[stepIndex].label,
      });
    }, 2200); // advance every 2.2 seconds

    try {
      // Step 1: Python computes statistics (this is the long wait)
      const stats = await computeStatistics(state.rawData, state.codebook, state.context, state.config);
      clearInterval(ticker);

      update({
        computedStats: stats,
        progress: 42,
        progressLabel: `✅ ${stats.tests_run.length} statistical tests complete — generating AI narrative...`,
        status: 'generating',
      });

      // Step 2: AI writes narrative (streaming)
      await generateNarrative(
        stats,
        state.codebook,
        state.context,
        (chunk) => {
          narrativeRef.current += chunk;
          setState(prev => ({
            ...prev,
            narrative: narrativeRef.current,
            progress: Math.min(95, prev.progress + 0.5),
            progressLabel: prev.progress < 60
              ? '✍️ Writing Chapter 4 — Data Analysis & Findings...'
              : prev.progress < 80
              ? '✍️ Writing Chapter 5 — Summary, Conclusion & Recommendations...'
              : '✍️ Polishing narrative and citations...',
          }));
        },
        async () => {
          // Step 3: Generate SPSS syntax
          update({ progress: 97, progressLabel: '🖥️ Generating SPSS syntax for all tests...' });
          const syntax = await generateSyntax(state.codebook, stats);
          update({ syntax, progress: 100, progressLabel: '🎉 Analysis complete!', status: 'complete' });
          toast.success('Analysis complete! Chapter 4 & 5 generated.');
        }
      );
    } catch (err: any) {
      clearInterval(ticker);
      update({ status: 'error', error: err.message, progressLabel: '' });
      toast.error(err.message);
    }
  }, [state, update]);


  // ─── Save to Supabase ────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!state.computedStats) return;
    try {
      const id = await saveAnalysis({
        title: state.context.title || state.filename,
        status: 'complete',
        raw_filename: state.filename,
        codebook: state.codebook,
        research_context: state.context,
        analysis_config: state.config,
        computed_stats: state.computedStats,
        generated_narrative: state.narrative,
        generated_syntax: state.syntax,
        n_respondents: state.computedStats.n_total,
        n_variables: state.codebook.length,
      });
      update({ isSaved: true, savedId: id });
      toast.success('Analysis saved to your project');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [state, update]);

  // ─── Reset / Start Over ───────────────────────────────────────────────────
  const reset = useCallback(() => {
    narrativeRef.current = '';
    setState({
      stage: 'upload',
      status: 'idle',
      progress: 0,
      progressLabel: '',
      rawData: [],
      headers: [],
      filename: '',
      codebook: [],
      context: DEFAULT_CONTEXT,
      config: DEFAULT_CONFIG,
      computedStats: null,
      narrative: '',
      syntax: '',
      isSaved: false,
      savedId: null,
      error: null,
    });
  }, []);

  // ─── Toggle Manual Test Selection ────────────────────────────────────────
  const toggleTest = useCallback((test: StatTest) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        selected_tests: prev.config.selected_tests.includes(test)
          ? prev.config.selected_tests.filter(t => t !== test)
          : [...prev.config.selected_tests, test],
      },
    }));
  }, []);

  return {
    ...state,
    handleFileUpload,
    updateCodebook,
    goToContext,
    updateContext,
    goToConfigure,
    updateConfig,
    runAnalysis,
    save,
    reset,
    toggleTest,
    setStage: (stage: AnalysisStage) => update({ stage }),
  };
}
