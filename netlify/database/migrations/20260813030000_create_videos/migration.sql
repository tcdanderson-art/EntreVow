CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  storage_key TEXT UNIQUE NOT NULL,
  duration_seconds INTEGER,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX videos_wedding_id_idx ON videos(wedding_id);
CREATE INDEX videos_status_idx ON videos(status);
