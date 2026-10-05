-- A grant must outlive the wedding it unlocked. With ON DELETE CASCADE, a couple
-- deleting their free wedding erased the grant row, returning the spot to the
-- counter and clearing the one-per-person evidence so they could claim again.
-- Now the wedding link is just nulled; couple, email and device uniqueness stay.
ALTER TABLE beta_grants ALTER COLUMN wedding_id DROP NOT NULL;
ALTER TABLE beta_grants DROP CONSTRAINT beta_grants_wedding_id_fkey;
ALTER TABLE beta_grants
  ADD CONSTRAINT beta_grants_wedding_id_fkey
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE SET NULL;
