import { supabase } from '@/lib/supabase';

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

export interface LogEventParams {
  analysisId: string;
  eventType: AnalysisEventType;
  payload?: Record<string, unknown>;
  datasetHash?: string;
  pythonVersion?: string;
  libraryVersions?: Record<string, string>;
  aiModel?: string;
  aiInputsSummary?: Record<string, unknown>;
}

/**
 * Logs an append-only event to the analysis_events table in Supabase.
 * Fails silently so audit logging errors never disrupt user research workflow.
 */
export async function logResearchEvent(params: LogEventParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('analysis_events')
      .insert({
        analysis_id: params.analysisId,
        event_type: params.eventType,
        payload: params.payload ?? {},
        dataset_hash: params.datasetHash ?? null,
        python_version: params.pythonVersion ?? '3.11',
        library_versions: params.libraryVersions ?? { pandas: '2.1.0', scipy: '1.11.0' },
        ai_model: params.aiModel ?? null,
        ai_inputs_summary: params.aiInputsSummary ?? null,
      });

    if (error) {
      console.warn('[ResearchEvent] Warning logging event:', {
        eventType: params.eventType,
        analysisId: params.analysisId,
        error: error.message,
      });
    }
  } catch (err) {
    console.warn('[ResearchEvent] Unexpected log error:', err);
  }
}
