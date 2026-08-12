CREATE TABLE wedding_tables (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wedding_tables_wedding_id_idx ON wedding_tables(wedding_id);
CREATE UNIQUE INDEX wedding_tables_wedding_id_name_idx ON wedding_tables(wedding_id, name);
