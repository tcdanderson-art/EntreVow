CREATE TABLE shuttles (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  driver_code TEXT UNIQUE NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX shuttles_wedding_id_idx ON shuttles(wedding_id);
CREATE INDEX shuttles_driver_code_idx ON shuttles(driver_code);
