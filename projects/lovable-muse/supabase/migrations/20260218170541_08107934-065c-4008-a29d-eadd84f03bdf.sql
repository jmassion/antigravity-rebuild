
-- Add thumbnail display control columns
ALTER TABLE projects 
  ADD COLUMN thumbnail_fit text NOT NULL DEFAULT 'cover',
  ADD COLUMN thumbnail_focus_x real NOT NULL DEFAULT 50,
  ADD COLUMN thumbnail_focus_y real NOT NULL DEFAULT 50;
