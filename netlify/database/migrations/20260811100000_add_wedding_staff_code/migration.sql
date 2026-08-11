ALTER TABLE weddings
  ADD COLUMN staff_code TEXT UNIQUE;

CREATE INDEX weddings_staff_code_idx ON weddings(staff_code);
