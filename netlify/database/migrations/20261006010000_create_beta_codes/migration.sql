-- Single-use codes you hand out by email to unlock a free beta spot. A code
-- with used_at set has been spent; the claim marks it in the same transaction
-- as the grant, so a code can never fund two weddings.
CREATE TABLE beta_codes (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
