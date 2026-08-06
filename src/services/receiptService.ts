import { supabase } from '@/integrations/supabase/client';
import { ComputedStats } from '@/types/analysis.types';

export interface ReceiptPayload {
  title: string;
  institution: string | null;
  datasetName: string;
  datasetHash: string;
  testsRun: string[];
  pythonVersion: string;
  libraryVersions: Record<string, string>;
  aiModel: string;
  generatedAt: string;
  syntax: string;
  stats: ComputedStats;
  narrativeExcerpt: string;
}

export interface ResearchReceipt {
  id: string;
  analysis_id: string;
  share_token: string;
  generated_at: string;
  payload: ReceiptPayload;
}

/**
 * Creates a research_receipt row in Supabase and returns the share token.
 * The token is a cryptographically random 64-char hex string generated server-side
 * via gen_random_bytes(32) in the DB column default.
 *
 * The supervisor verification URL is:
 *   https://your-domain.com/verify/<share_token>
 *
 * @returns share_token string
 */
export async function createResearchReceipt(params: {
  analysisId: string;
  payload: ReceiptPayload;
}): Promise<string> {
  const { data, error } = await (supabase as any)
    .from('research_receipts')
    .insert({
      analysis_id: params.analysisId,
      payload: params.payload,
      receipt_version: '1.0',
    })
    .select('share_token')
    .single();

  if (error) throw new Error(`Failed to create receipt: ${error.message}`);
  return data.share_token as string;
}

/**
 * Fetches a research_receipt by its share_token.
 * This is a PUBLIC read — no authentication required.
 * The research_receipts table must have a policy:
 *   FOR SELECT USING (true) — or using (share_token = $1)
 * so that supervisors can access it without a WriteWise account.
 */
export async function fetchReceiptByToken(token: string): Promise<ResearchReceipt | null> {
  const { data, error } = await (supabase as any)
    .from('research_receipts')
    .select('id, analysis_id, share_token, generated_at, payload')
    .eq('share_token', token)
    .single();

  if (error || !data) return null;
  return data as ResearchReceipt;
}
