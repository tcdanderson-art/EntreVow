ALTER TABLE weddings
  ADD COLUMN plan_tier TEXT,
  ADD COLUMN paid_at TIMESTAMPTZ,
  ADD COLUMN stripe_checkout_session_id TEXT;
