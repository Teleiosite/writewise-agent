-- WriteWise AI Data Analysis — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ── Analysis Sessions Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  -- Input
  raw_filename VARCHAR(255),
  codebook JSONB DEFAULT '[]'::jsonb,
  research_context JSONB DEFAULT '{}'::jsonb,
  analysis_config JSONB DEFAULT '{}'::jsonb,
  -- Results
  computed_stats JSONB,
  generated_narrative TEXT,
  generated_syntax TEXT,
  -- Meta
  ai_model_used VARCHAR(100),
  n_respondents INTEGER DEFAULT 0,
  n_variables INTEGER DEFAULT 0,
  tests_run TEXT[] DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE data_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own analyses"
  ON data_analyses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_data_analyses_project ON data_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_data_analyses_user ON data_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_data_analyses_created ON data_analyses(created_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_data_analyses_updated_at
  BEFORE UPDATE ON data_analyses
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ── Verify ────────────────────────────────────────────────────────────────────
-- After running, check this returns the table:
SELECT table_name FROM information_schema.tables WHERE table_name = 'data_analyses';
