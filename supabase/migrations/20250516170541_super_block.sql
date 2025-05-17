/*
  # Create tasks and tags tables

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) 
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `due_date` (timestamptz)
      - `completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text)
      - `color` (text)
      - `user_id` (uuid, foreign key to auth.users)
    - `task_tags`
      - `task_id` (uuid, foreign key to tasks)
      - `tag_id` (uuid, foreign key to tags)
  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text DEFAULT '',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  completed boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT 'blue',
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for tags
CREATE POLICY "Users can manage their own tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for task_tags
CREATE POLICY "Users can manage task_tags they own"
  ON task_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
  ));