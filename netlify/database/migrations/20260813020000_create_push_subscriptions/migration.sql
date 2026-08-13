CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX push_subscriptions_guest_id_idx ON push_subscriptions(guest_id);
