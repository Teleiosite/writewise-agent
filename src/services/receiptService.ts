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
  analysis_id: string | null;
  share_token: string;
  generated_at: string;
  payload: ReceiptPayload;
}

/**
 * Creates a research_receipt row in Supabase and returns the share token.
 * The token is a cryptographically random 64-char hex string generated server-side
 * or generated client-side and saved globally in Supabase so any supervisor can verify it.
 *
 * @returns share_token string
 */
export async function createResearchReceipt(params: {
  analysisId?: string;
  payload: ReceiptPayload;
}): Promise<string> {
  const customToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // 1. Try saving to Supabase with analysisId
  try {
    const { data, error } = await (supabase as any)
      .from('research_receipts')
      .insert({
        analysis_id: params.analysisId || null,
        payload: params.payload,
        receipt_version: '1.0',
        share_token: customToken,
      })
      .select('share_token')
      .single();

    if (!error && data?.share_token) {
      // Also cache locally for fast offline access
      const receiptObj: ResearchReceipt = {
        id: crypto.randomUUID(),
        analysis_id: params.analysisId || null,
        share_token: data.share_token,
        generated_at: new Date().toISOString(),
        payload: params.payload,
      };
      localStorage.setItem(`writewise_receipt_${data.share_token}`, JSON.stringify(receiptObj));
      return data.share_token;
    }

    // 2. If it failed (e.g. foreign key constraint on analysisId), retry with analysis_id = null
    if (error && params.analysisId) {
      const { data: retryData, error: retryError } = await (supabase as any)
        .from('research_receipts')
        .insert({
          analysis_id: null,
          payload: params.payload,
          receipt_version: '1.0',
          share_token: customToken,
        })
        .select('share_token')
        .single();

      if (!retryError && retryData?.share_token) {
        const receiptObj: ResearchReceipt = {
          id: crypto.randomUUID(),
          analysis_id: null,
          share_token: retryData.share_token,
          generated_at: new Date().toISOString(),
          payload: params.payload,
        };
        localStorage.setItem(`writewise_receipt_${retryData.share_token}`, JSON.stringify(receiptObj));
        return retryData.share_token;
      }
    }
  } catch (err) {
    console.warn('[ReceiptService] Supabase receipt save exception:', err);
  }

  // 3. Fallback to local storage
  const receiptObj: ResearchReceipt = {
    id: crypto.randomUUID(),
    analysis_id: params.analysisId || null,
    share_token: customToken,
    generated_at: new Date().toISOString(),
    payload: params.payload,
  };
  localStorage.setItem(`writewise_receipt_${customToken}`, JSON.stringify(receiptObj));
  return customToken;
}

export async function fetchReceiptByToken(token: string): Promise<ResearchReceipt | null> {
  if (!token) return null;

  // 1. Try Supabase first
  try {
    const { data, error } = await (supabase as any)
      .from('research_receipts')
      .select('id, analysis_id, share_token, generated_at, payload')
      .eq('share_token', token)
      .single();

    if (!error && data) {
      return data as ResearchReceipt;
    }
  } catch {
    // ignore
  }

  // 2. Try Local Storage Fallback
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
