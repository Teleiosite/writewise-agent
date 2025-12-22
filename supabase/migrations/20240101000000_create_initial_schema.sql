
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  last_edited TIMESTAMPTZ DEFAULT now(),
  word_count INTEGER DEFAULT 0,
  collaborators INTEGER DEFAULT 0
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  "order" INTEGER
);

-- Enable Row-Level Security (RLS) for the tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create policies to control access to the data
CREATE POLICY "Users can see their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can see sections of their own projects" ON sections
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can create sections for their own projects" ON sections
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can update sections of their own projects" ON sections
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can delete sections of their own projects" ON sections
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));
