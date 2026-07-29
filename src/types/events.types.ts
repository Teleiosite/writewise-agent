export type AnalysisEventType =
  | 'DATASET_UPLOADED'
  | 'DATASET_REPLACED'
  | 'CODEBOOK_CONFIGURED'
  | 'ANALYSIS_EXECUTED'
  | 'ANALYSIS_RERUN'
  | 'RESULT_GENERATED'
  | 'NARRATIVE_GENERATED'
  | 'NARRATIVE_REGENERATED'
  | 'SPSS_SYNTAX_GENERATED'
  | 'CLAIM_VERIFICATION_RUN'
  | 'INTEGRITY_REPORT_GENERATED'
  | 'SUPERVISOR_SHARE_CREATED'
  | 'SUPERVISOR_VIEWED'
  | 'SUPERVISOR_VERIFIED'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTION_SUBMITTED'
  | 'SUBMISSION_LOCKED';

export interface AnalysisEvent {
  id: number;
  analysis_id: string;
  research_identity_id?: string | null;
  event_type: AnalysisEventType;
  payload: Record<string, unknown>;
  dataset_hash?: string | null;
  python_version?: string | null;
  library_versions?: Record<string, string> | null;
  ai_model?: string | null;
  ai_inputs_summary?: Record<string, unknown> | null;
  created_at: string;
}

export interface DatasetHashRecord {
  id: string;
  analysis_id: string;
  sha256_hash: string;
  filename: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  registered_at: string;
}
