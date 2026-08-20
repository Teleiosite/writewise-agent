-- User API Settings table
CREATE TABLE IF NOT EXISTS public.user_api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  provider TEXT,
  model TEXT,
  api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_api_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own settings only
CREATE POLICY "Users can manage own API settings"
  ON public.user_api_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
