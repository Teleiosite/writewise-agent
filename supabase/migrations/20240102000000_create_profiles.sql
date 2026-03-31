-- Profiles table: stores user settings and preferences
-- Linked 1-to-1 with auth.users via RLS

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text,
  bio           text,
  avatar_url    text,
  email_notifications boolean NOT NULL DEFAULT true,
  ai_suggestions      boolean NOT NULL DEFAULT true,
  auto_save           boolean NOT NULL DEFAULT true,
  font_size           integer NOT NULL DEFAULT 16,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
