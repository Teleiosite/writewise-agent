-- ============================================================
-- WRITEWISE PHASE 0 MIGRATION — RESEARCH INTEGRITY ENGINE
-- Append-only event architecture, dataset hashing, and GDPR layer
-- ============================================================

-- Pseudonymised identity layer for GDPR compliance
-- Separates the person from their research history
CREATE TABLE IF NOT EXISTS research_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE research_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own identity" ON research_identities
  FOR ALL USING (auth.uid() = user_id);

-- The append-only provenance event log
-- Central trust table of the Research Integrity Engine
CREATE TABLE IF NOT EXISTS analysis_events (
  id BIGSERIAL PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
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

-- Database-level rules enforcing append-only behavior
CREATE RULE no_update_analysis_events AS
  ON UPDATE TO analysis_events DO INSTEAD NOTHING;

CREATE RULE no_delete_analysis_events AS
  ON DELETE TO analysis_events DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_events_analysis ON analysis_events(analysis_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analysis_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON analysis_events(created_at DESC);

ALTER TABLE analysis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own events" ON analysis_events
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users insert own events" ON analysis_events
  FOR INSERT WITH CHECK (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );

-- Cryptographic fingerprints of uploaded datasets
CREATE TABLE IF NOT EXISTS dataset_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  sha256_hash VARCHAR(64) NOT NULL,
  filename VARCHAR(255),
  file_size_bytes BIGINT,
  row_count INTEGER,
  column_count INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hashes_unique ON dataset_hashes(sha256_hash, analysis_id);
CREATE INDEX IF NOT EXISTS idx_hashes_analysis ON dataset_hashes(analysis_id);

ALTER TABLE dataset_hashes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hashes" ON dataset_hashes
  FOR ALL USING (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );

-- Assembled integrity reports (generated once, immutable)
CREATE TABLE IF NOT EXISTS research_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  receipt_version VARCHAR(10) NOT NULL DEFAULT '1.0',
  payload JSONB NOT NULL,
  share_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_receipts AS
  ON UPDATE TO research_receipts DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_receipts_analysis ON research_receipts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_receipts_token ON research_receipts(share_token);
