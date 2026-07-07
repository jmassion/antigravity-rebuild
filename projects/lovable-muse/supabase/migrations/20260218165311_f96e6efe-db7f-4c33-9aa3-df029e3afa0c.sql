-- Add parent_id for project hierarchy
ALTER TABLE projects ADD COLUMN parent_id uuid NULL
  REFERENCES projects(id) ON DELETE SET NULL;

-- Index for efficient tree queries
CREATE INDEX idx_projects_parent_id ON projects(parent_id);