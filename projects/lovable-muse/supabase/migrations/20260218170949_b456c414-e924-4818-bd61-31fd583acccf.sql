
ALTER TABLE docs
  ADD COLUMN parent_id uuid NULL REFERENCES docs(id) ON DELETE SET NULL,
  ADD COLUMN icon text NOT NULL DEFAULT '';

CREATE INDEX idx_docs_parent_id ON docs(parent_id);
