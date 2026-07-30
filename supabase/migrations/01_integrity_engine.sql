-- ============================================================
-- WriteWise Research Integrity Engine Migration
-- Immutable append-only tables for research provenance
-- ============================================================

-- 1. Pseudonymised identity layer for GDPR compliance
CREATE TABLE IF NOT EXISTS research_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE research_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own identity" ON research_identities
  FOR ALL USING (auth.uid() = user_id);

-- 2. Append-only provenance event log
CREATE TABLE IF NOT EXISTS analysis_events (
  id BIGSERIAL PRIMARY KEY,
  analysis_id UUID NOT NULL,
  research_identity_id UUID REFERENCES research_identities(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  dataset_hash VARCHAR(64),
  python_version VARCHAR(20),
  library_versions JSONB,
  ai_model VARCHAR(100),
  ai_inputs_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce append-only rules at database level
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'no_update_analysis_events') THEN
    CREATE RULE no_update_analysis_events AS ON UPDATE TO analysis_events DO INSTEAD NOTHING;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'no_delete_analysis_events') THEN
    CREATE RULE no_delete_analysis_events AS ON DELETE TO analysis_events DO INSTEAD NOTHING;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_analysis ON analysis_events(analysis_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analysis_events(event_type);

ALTER TABLE analysis_events ENABLE ROW LEVEL SECURITY;

-- 3. Cryptographic fingerprints of uploaded datasets
CREATE TABLE IF NOT EXISTS dataset_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  filename VARCHAR(255),
  file_size_bytes BIGINT,
  row_count INTEGER,
  column_count INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashes_analysis ON dataset_hashes(analysis_id);

ALTER TABLE dataset_hashes ENABLE ROW LEVEL SECURITY;

-- 4. Assembled integrity receipts for supervisor verification
CREATE TABLE IF NOT EXISTS research_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL,
  receipt_version VARCHAR(10) NOT NULL DEFAULT '1.0',
  payload JSONB NOT NULL,
  share_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'no_update_receipts') THEN
    CREATE RULE no_update_receipts AS ON UPDATE TO research_receipts DO INSTEAD NOTHING;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_receipts_token ON research_receipts(share_token);

ALTER TABLE research_receipts ENABLE ROW LEVEL SECURITY;
