// ─── Codebook & Context ───────────────────────────────────────────────────────

export interface CodebookVariable {
  column: string;
  label: string;
  type: "nominal" | "ordinal" | "scale";
  role: "IV" | "DV" | "Mediator" | "Moderator" | "Control" | "None";
  values: Record<string, string> | null;
  missing_code: number | null;
  section_label: string | null;
}

export interface ResearchContext {
  title: string;
  institution: string | null;
  objectives: string[];
  research_questions: string[];
  hypothesis: string | null;
  theoretical_framework: string | null;
}

// ─── Descriptive Results ──────────────────────────────────────────────────────

export interface DescriptiveStats {
  variable: string;
  label: string;
  type: "nominal" | "ordinal" | "scale";
  n: number;
  missing: number;
  mean: number | null;
  median: number | null;
  mode: number | null;
  std_dev: number | null;
  variance: number | null;
  min: number | null;
  max: number | null;
  range: number | null;
  iqr: number | null;
  skewness: number | null;
  kurtosis: number | null;
  frequencies: Record<string, number>;
  percentages: Record<string, number>;
  value_labels: Record<string, string> | null;
}

// ─── Normality Results ────────────────────────────────────────────────────────

export interface NormalityTest {
  variable: string;
  label: string;
  shapiro_wilk?: { statistic: number; p_value: number; normal: boolean };
  kolmogorov_smirnov: { statistic: number; p_value: number; normal: boolean };
  skewness: number;
  kurtosis: number;
}

// ─── Reliability Results ──────────────────────────────────────────────────────

export interface ReliabilityResult {
  scale_name: string;
  variables: string[];
  n_items: number;
  n_respondents: number;
  cronbach_alpha: number;
  mcdonalds_omega: number | null;
  interpretation: "Excellent" | "Good" | "Acceptable" | "Questionable" | "Poor" | "Unacceptable";
}

// ─── Section Stats ────────────────────────────────────────────────────────────

export interface SectionItemStats {
  variable: string;
  label: string;
  n: number;
  mean: number;
  std_dev: number;
  frequencies: Record<string, number>;
  percentages: Record<string, number>;
}

export interface SectionStats {
  section_name: string;
  variables: SectionItemStats[];
  section_mean: number;
  section_std: number;
}

// ─── Correlation Results ──────────────────────────────────────────────────────

export interface CorrelationResult {
  pearson_r: number;
  spearman_rho: number;
  p_value: number;
  n: number;
  significant: boolean;
  effect_size: "Strong" | "Moderate" | "Weak" | "Negligible";
  iv_label: string;
  dv_label: string;
}

export interface CorrelationMatrix {
  variables: string[];
  labels: string[];
  matrix: Array<Array<{ r: number | null; p: number | null; sig: boolean }>>;
}

// ─── Group Comparison Results ─────────────────────────────────────────────────

export interface GroupStats {
  n: number;
  mean: number;
  sd: number;
}

export interface TTestResult {
  test: string;
  group_variable: string;
  group_label: string;
  dv_label: string;
  groups: Record<string, GroupStats>;
  t_statistic: number;
  p_value: number;
  significant: boolean;
  cohens_d: number;
  effect_size: "Large" | "Medium" | "Small" | "Negligible";
  mann_whitney_u: number;
  mann_whitney_p: number;
}

export interface AnovaResult {
  test: string;
  group_variable: string;
  group_label: string;
  dv_label: string;
  groups: Record<string, GroupStats>;
  f_statistic: number;
  p_value: number;
  significant: boolean;
  eta_squared: number;
  effect_size: "Large" | "Medium" | "Small";
  kruskal_wallis_h: number;
  kruskal_wallis_p: number;
}

export interface ChiSquareResult {
  test: string;
  col1_label: string;
  col2_label: string;
  chi2: number;
  p_value: number;
  df: number;
  n: number;
  significant: boolean;
  cramers_v: number;
  fisher_exact_p: number | null;
  contingency_table: Record<string, Record<string, number>>;
}

// ─── Regression Results ───────────────────────────────────────────────────────

export interface RegressionPredictor {
  variable: string;
  label: string;
  beta: number;
  std_error: number;
  t_statistic: number;
  p_value: number;
  significant: boolean;
}

export interface RegressionResult {
  test: string;
  dv_label: string;
  r_squared: number;
  adj_r_squared: number;
  f_statistic: number;
  f_p_value: number;
  significant: boolean;
  n: number;
  predictors: RegressionPredictor[];
  equation: string;
}

export interface LogisticPredictor {
  variable: string;
  label: string;
  coefficient: number;
  odds_ratio: number;
  p_value: number;
  significant: boolean;
}

export interface LogisticRegressionResult {
  test: string;
  dv_label: string;
  pseudo_r_squared: number;
  log_likelihood: number;
  aic: number;
  n: number;
  predictors: LogisticPredictor[];
}

// ─── Factor Analysis ──────────────────────────────────────────────────────────

export interface FactorAnalysisResult {
  test: string;
  n_factors: number;
  variables: string[];
  labels: string[];
  loadings: number[][];
  eigenvalues: number[];
  variance_explained: number[];
  rotation: string;
  n_respondents: number;
}

// ─── Mediation & Moderation ───────────────────────────────────────────────────

export interface MediationResult {
  test: string;
  iv_label: string;
  mediator_label: string;
  dv_label: string;
  path_a: number;
  path_a_p: number;
  path_b: number;
  path_c: number;
  path_c_p: number;
  path_c_prime: number;
  indirect_effect: number;
  n: number;
  mediation_type: "Full" | "Partial" | "None";
}

export interface ModerationResult {
  test: string;
  iv_label: string;
  moderator_label: string;
  dv_label: string;
  r_squared: number;
  interaction_beta: number;
  interaction_p: number;
  significant: boolean;
  n: number;
}

// ─── Umbrella Computed Stats ──────────────────────────────────────────────────

export interface ComputedStats {
  n_total: number;
  n_valid: number;
  response_rate: number;
  tests_run: string[];
  descriptive?: DescriptiveStats[];
  normality?: NormalityTest[];
  reliability?: ReliabilityResult[];
  section_stats?: Record<string, SectionStats>;
  correlation?: CorrelationResult | null;
  correlation_matrix?: CorrelationMatrix | null;
  group_comparisons?: Array<TTestResult | AnovaResult>;
  chi_square?: ChiSquareResult[];
  regression?: RegressionResult | null;
  logistic_regression?: LogisticRegressionResult | null;
  factor_analysis?: FactorAnalysisResult | null;
  mediation?: MediationResult | null;
  moderation?: ModerationResult | null;
}

// ─── Analysis Config ──────────────────────────────────────────────────────────

export type AnalysisMode = "auto" | "manual";

export type StatTest =
  | "descriptive" | "normality" | "reliability" | "section_stats"
  | "correlation" | "correlation_matrix"
  | "ttest" | "anova" | "chi_square"
  | "regression" | "logistic_regression"
  | "factor_analysis" | "mediation" | "moderation";

export interface AnalysisConfig {
  mode: AnalysisMode;
  selected_tests: StatTest[];
}

// ─── Wizard Stages ────────────────────────────────────────────────────────────

export type AnalysisStage =
  | "upload"
  | "codebook"
  | "context"
  | "configure"
  | "results";

export type AnalysisStatus =
  | "idle"
  | "parsing"
  | "detecting"
  | "computing"
  | "generating"
  | "complete"
  | "error";

// ─── Saved Analysis (Supabase) ────────────────────────────────────────────────

export interface DataAnalysis {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  status: AnalysisStatus;
  raw_filename: string;
  codebook: CodebookVariable[];
  research_context: ResearchContext;
  analysis_config: AnalysisConfig;
  computed_stats: ComputedStats;
  generated_narrative: string;
  generated_syntax: string;
  ai_model_used: string;
  n_respondents: number;
  n_variables: number;
  tests_run: string[];
  created_at: string;
}
