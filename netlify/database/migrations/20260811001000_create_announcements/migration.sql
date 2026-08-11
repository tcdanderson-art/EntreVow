CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visible_to_groups TEXT[] NOT NULL DEFAULT ARRAY['general']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX announcements_wedding_id_idx ON announcements(wedding_id);
