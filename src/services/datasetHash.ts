import { supabase } from '@/integrations/supabase/client';

/**
 * Computes SHA-256 hash of a dataset file in the browser using Web Crypto API.
 * This happens client-side before any data transmission.
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Registers dataset hash in Supabase dataset_hashes table.
 * Fails silently to prevent blocking research workflow if network is offline.
 */
export async function registerDatasetHash(
  analysisId: string,
  file: File,
  hash: string,
  rowCount: number,
  columnCount: number
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from('dataset_hashes')
      .insert({
        analysis_id: analysisId,
        sha256_hash: hash,
        filename: file.name,
        file_size_bytes: file.size,
        row_count: rowCount,
        column_count: columnCount,
      });

    if (error) {
      console.warn('[DatasetHash] Hash registration warning:', error.message);
    }
  } catch (err) {
    console.warn('[DatasetHash] Failed to register hash:', err);
  }
}
