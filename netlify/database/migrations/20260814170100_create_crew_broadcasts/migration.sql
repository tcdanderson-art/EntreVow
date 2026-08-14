CREATE TABLE crew_broadcasts (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  roles TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX crew_broadcasts_wedding_id_idx ON crew_broadcasts(wedding_id);
