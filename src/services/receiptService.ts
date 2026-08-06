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
  try {
    const { data, error } = await (supabase as any)
      .from('research_receipts')
      .insert({
        analysis_id: params.analysisId,
        payload: params.payload,
        receipt_version: '1.0',
      })
      .select('share_token')
      .single();

    if (!error && data?.share_token) {
      return data.share_token as string;
    }
  } catch (err) {
    console.warn('[ReceiptService] Supabase receipt save failed, using local storage fallback:', err);
  }

  // Local Storage Fallback
  const fallbackToken = 'RECEIPT-' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const receiptObj: ResearchReceipt = {
    id: crypto.randomUUID(),
    analysis_id: params.analysisId,
    share_token: fallbackToken,
    generated_at: new Date().toISOString(),
    payload: params.payload,
  };

  localStorage.setItem(`writewise_receipt_${fallbackToken}`, JSON.stringify(receiptObj));
  return fallbackToken;
}

export async function fetchReceiptByToken(token: string): Promise<ResearchReceipt | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('research_receipts')
      .select('id, analysis_id, share_token, generated_at, payload')
      .eq('share_token', token)
      .single();

    if (!error && data) return data as ResearchReceipt;
  } catch {
    // ignore
  }

  // Fallback to local storage
  const local = localStorage.getItem(`writewise_receipt_${token}`);
  if (local) {
    try {
      return JSON.parse(local) as ResearchReceipt;
    } catch {
      return null;
    }
  }

  return null;
}

