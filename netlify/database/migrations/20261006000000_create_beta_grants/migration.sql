-- Free Full Day-Of grants for the first 35 real checkouts (beta offer).
-- One row = one spent free spot, so COUNT(*) is the live counter. The UNIQUE
-- constraints are the backstop for the one-grant-per-person rule: even if the
-- app-level check were raced or bypassed, the same couple, normalized email
-- or device cookie can never be inserted twice.
CREATE TABLE beta_grants (
  id SERIAL PRIMARY KEY,
  couple_id INTEGER NOT NULL UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  wedding_id INTEGER NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  normalized_email TEXT NOT NULL UNIQUE,
  device_hash TEXT NOT NULL UNIQUE,
  fingerprint_hash TEXT,
  ip_hash TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Looked up together: the same browser fingerprint from the same network.
CREATE INDEX beta_grants_fp_ip_idx ON beta_grants(fingerprint_hash, ip_hash);
