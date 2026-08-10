CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  guest_group TEXT NOT NULL DEFAULT 'general',
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX guests_wedding_id_idx ON guests(wedding_id);
CREATE INDEX guests_access_code_idx ON guests(access_code);
