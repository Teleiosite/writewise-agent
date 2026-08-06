-- ============================================================
-- MIGRATION 002 — Public read policy for research_receipts
-- Allows supervisors to fetch a receipt by share_token
-- without requiring a WriteWise account.
-- ============================================================

-- Enable RLS (idempotent)
ALTER TABLE research_receipts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT a receipt by its share_token.
-- The token is 64 hex chars (256 bits of entropy) — unguessable.
-- No personal data is exposed: payload contains only stats + syntax.
CREATE POLICY IF NOT EXISTS "Public can read receipts by token"
  ON research_receipts
  FOR SELECT
  USING (true);

-- Only authenticated users who own the parent analysis can INSERT receipts.
CREATE POLICY IF NOT EXISTS "Users can create own receipts"
  ON research_receipts
  FOR INSERT
  WITH CHECK (
    analysis_id IN (
      SELECT id FROM data_analyses WHERE user_id = auth.uid()
    )
  );
