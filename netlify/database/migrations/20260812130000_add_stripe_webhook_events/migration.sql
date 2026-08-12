-- Tracks Stripe webhook event IDs already processed, so redelivered events
-- (Stripe's at-least-once delivery: retries and manual dashboard redelivery)
-- are skipped instead of re-applying stale plan_tier/paid_at state or
-- re-sending receipt/refund emails. Deduping by event.id (not session.id)
-- is Stripe's own recommended idempotency approach and, unlike comparing
-- against a wedding's single "current session" column, stays correct
-- regardless of what other events have landed in between.
CREATE TABLE stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
