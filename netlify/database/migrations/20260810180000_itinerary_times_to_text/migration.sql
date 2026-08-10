-- Wedding itinerary times are wall-clock times at the venue (e.g. "1:00 PM"),
-- not instants tied to a timezone. TIMESTAMPTZ silently reinterpreted the
-- naive datetime-local input as UTC on write and shifted it again on read,
-- producing wrong times for any viewer not in UTC. Store as plain text.
ALTER TABLE itinerary_items
  ALTER COLUMN start_time TYPE TEXT USING to_char(start_time, 'YYYY-MM-DD"T"HH24:MI'),
  ALTER COLUMN end_time TYPE TEXT USING to_char(end_time, 'YYYY-MM-DD"T"HH24:MI');
