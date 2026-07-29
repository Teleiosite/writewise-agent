import { supabase } from '@/integrations/supabase/client';

/**
 * Computes SHA-256 hash of a file client-side using the browser Web Crypto API.
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Registers a dataset hash in the dataset_hashes table.
 */
export async function registerDatasetHash(
  analysisId: string,
  file: File,
  hash: string,
  rowCount: number,
  columnCount: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('dataset_hashes' as any)
      .insert({
        analysis_id: analysisId,
        sha256_hash: hash,
        filename: file.name,
        file_size_bytes: file.size,
        row_count: rowCount,
        column_count: columnCount,
      });

    if (error) {
      console.warn('[DatasetHash] Hash registration notice:', error.message);
    }
  } catch (err) {
    console.warn('[DatasetHash] Hash registration exception:', err);
  }
}
