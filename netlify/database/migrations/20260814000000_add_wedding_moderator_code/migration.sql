ALTER TABLE weddings
  ADD COLUMN moderator_code TEXT UNIQUE;

CREATE INDEX weddings_moderator_code_idx ON weddings(moderator_code);
