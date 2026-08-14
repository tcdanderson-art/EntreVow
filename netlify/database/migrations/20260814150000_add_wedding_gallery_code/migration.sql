ALTER TABLE weddings
  ADD COLUMN gallery_code TEXT UNIQUE;

CREATE INDEX weddings_gallery_code_idx ON weddings(gallery_code);
