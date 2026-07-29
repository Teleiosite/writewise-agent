import { supabase } from '@/integrations/supabase/client';
import { AnalysisEventType } from '@/types/events.types';

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
 * Logs an append-only event to the research integrity provenance log.
 * Fails silently so audit logging never interrupts user workflows.
 */
export async function logResearchEvent(params: LogEventParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('analysis_events' as any)
      .insert({
        analysis_id: params.analysisId,
        event_type: params.eventType,
        payload: params.payload ?? {},
        dataset_hash: params.datasetHash ?? null,
        python_version: params.pythonVersion ?? null,
        library_versions: params.libraryVersions ?? null,
        ai_model: params.aiModel ?? null,
        ai_inputs_summary: params.aiInputsSummary ?? null,
      });

    if (error) {
      console.warn('[ResearchEvent] Event log notice:', error.message);
    }
  } catch (err) {
    console.warn('[ResearchEvent] Unexpected event log exception:', err);
  }
}
