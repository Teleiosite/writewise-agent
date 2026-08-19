-- ============================================================
-- WRITEWISE MIGRATION 003 — FLEXIBLE RESEARCH RECEIPTS
-- Allows receipts to be created without strict foreign key blocking
-- ============================================================

-- Make analysis_id optional so anonymous/guest receipts can be generated immediately
ALTER TABLE IF EXISTS research_receipts ALTER COLUMN analysis_id DROP NOT NULL;
ALTER TABLE IF EXISTS research_receipts DROP CONSTRAINT IF EXISTS research_receipts_analysis_id_fkey;

-- Ensure anyone can create and view receipts (for supervisor verification)
DROP POLICY IF EXISTS "Public read receipts" ON research_receipts;
CREATE POLICY "Public read receipts" ON research_receipts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert receipts" ON research_receipts;
CREATE POLICY "Public insert receipts" ON research_receipts
  FOR INSERT WITH CHECK (true);
