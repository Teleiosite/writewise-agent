import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  CodebookVariable, ResearchContext, AnalysisConfig, 
  ComputedStats, AnalysisStage, AnalysisStatus, StatTest, DataAnalysis 
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

const INITIAL_STATE: AnalysisState = {
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
};

const ACTIVE_ANALYSIS_STORAGE_KEY = 'writewise_active_analysis';

function loadInitialState(): AnalysisState {
  try {
    const cached = localStorage.getItem(ACTIVE_ANALYSIS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.computedStats || parsed.rawData?.length || parsed.stage !== 'upload')) {
        return { ...INITIAL_STATE, ...parsed, status: parsed.status === 'computing' || parsed.status === 'generating' ? 'idle' : parsed.status };
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_STATE;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(loadInitialState);

  const narrativeRef = useRef(state.narrative || '');
  const abortRef = useRef(false);

  // Sync narrativeRef when state changes
  useEffect(() => {
    narrativeRef.current = state.narrative || '';
  }, [state.narrative]);

  // Auto-persist active analysis state to localStorage on changes
  useEffect(() => {
    if (state.stage !== 'upload' || state.computedStats || state.narrative || state.rawData.length > 0) {
      try {
        localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn('Failed to auto-save active analysis:', err);
      }
    }
  }, [state]);

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

  // ─── Stage 2: Codebook Review ────────────────────────────────────────────
  const updateCodebook = useCallback((codebook: CodebookVariable[]) => {
    update({ codebook });
  }, [update]);

  const goToContext = useCallback(() => {
    if (!state.codebook.length) {
      toast.error('Codebook cannot be empty');
      return;
    }
    update({ stage: 'context' });
  }, [state.codebook, update]);

  // ─── Stage 3: Research Context ───────────────────────────────────────────
  const updateContext = useCallback((context: ResearchContext) => {
    update({ context });
  }, [update]);

  const goToConfigure = useCallback(() => {
    if (!state.context.title.trim()) {
      toast.error('Please enter a research title');
      return;
    }
    update({ stage: 'configure' });
  }, [state.context.title, update]);

  // ─── Stage 4: Analysis Configuration ─────────────────────────────────────
  const updateConfig = useCallback((config: AnalysisConfig) => {
    update({ config });
  }, [update]);

  // ─── Stage 5: Run Full Analysis Pipeline ─────────────────────────────────
  const runAnalysis = useCallback(async () => {
    narrativeRef.current = '';
    abortRef.current = false;

    // Build the list of step messages to cycle through based on tests
    const tests = state.config.mode === 'auto'
      ? ['descriptive', 'normality', 'reliability', 'correlation', 'regression']
      : state.config.selected_tests;

    const stepMessages: { label: string; progress: number }[] = [
      { label: '📊 Loading dataset and verifying variables...', progress: 5 },
      { label: '📐 Computing descriptive statistics for all items...', progress: 12 },
      { label: '🔍 Testing normality (Shapiro-Wilk & Kolmogorov-Smirnov)...', progress: 20 },
      { label: '🛡️ Computing scale reliability (Cronbach\'s Alpha)...', progress: 25 },
      { label: '🔗 Building Pearson & Spearman correlation matrices...', progress: 30 },
    ];

    const testStepMap: Record<string, { label: string; progress: number }> = {
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
    }, 2200);

    try {
      const coldStartTimer = setTimeout(() => {
        update({
          progressLabel: '☕ Statistics engine is warming up — this takes 20–30 seconds on first use. Your analysis is running...',
        });
      }, 5000);

      // Step 1: Python computes statistics
      const stats = await computeStatistics(state.rawData, state.codebook, state.context, state.config);
      clearTimeout(coldStartTimer);
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
          const syntax = await generateSyntax(state.codebook, state.config);
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

  // ─── Save to Supabase & LocalStorage ─────────────────────────────────────
  const save = useCallback(async () => {
    if (!state.computedStats) return;
    try {
      const saved = await saveAnalysis({
        id: state.savedId || undefined,
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
      update({ isSaved: true, savedId: saved.id });
      toast.success('Analysis saved! You can access it anytime from Active Workspaces.');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [state, update]);

  // ─── Load Saved Analysis ──────────────────────────────────────────────────
  const loadSavedAnalysis = useCallback((analysis: DataAnalysis) => {
    const rawContext = analysis.research_context || (analysis as any).context || DEFAULT_CONTEXT;
    const rawConfig = analysis.analysis_config || (analysis as any).config || DEFAULT_CONFIG;
    const rawStats = analysis.computed_stats || null;
    const rawNarrative = analysis.generated_narrative || (analysis as any).narrative || '';
    const rawSyntax = analysis.generated_syntax || (analysis as any).syntax || '';

    narrativeRef.current = rawNarrative;

    const loadedState: AnalysisState = {
      stage: 'results',
      status: 'complete',
      progress: 100,
      progressLabel: 'Analysis loaded',
      rawData: [],
      headers: (analysis.codebook || []).map(c => c.column),
      filename: analysis.raw_filename || 'dataset.xlsx',
      codebook: analysis.codebook || [],
      context: rawContext,
      config: rawConfig,
      computedStats: rawStats,
      narrative: rawNarrative,
      syntax: rawSyntax,
      isSaved: true,
      savedId: analysis.id,
      error: null,
    };

    setState(loadedState);
    try {
      localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, JSON.stringify(loadedState));
    } catch {
      // ignore
    }
    toast.success(`Loaded analysis: "${analysis.title}"`);
  }, []);

  // ─── Reset / Start Over ───────────────────────────────────────────────────
  const reset = useCallback(() => {
    narrativeRef.current = '';
    localStorage.removeItem(ACTIVE_ANALYSIS_STORAGE_KEY);
    setState(INITIAL_STATE);
    toast.info('Started a new analysis workspace.');
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
    loadSavedAnalysis,
    reset,
    toggleTest,
    setStage: (stage: AnalysisStage) => update({ stage }),
  };
}
