-- Writing goals table: per-project goals with progress tracking

CREATE TABLE IF NOT EXISTS writing_goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  target      integer NOT NULL,
  current     integer NOT NULL DEFAULT 0,
  unit        text NOT NULL DEFAULT 'words',   -- words | pages | sections | citations
  deadline    timestamptz,
  completed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON writing_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
