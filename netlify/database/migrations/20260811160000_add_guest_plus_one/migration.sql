ALTER TABLE guests
  ADD COLUMN plus_one_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN plus_one_name TEXT;
