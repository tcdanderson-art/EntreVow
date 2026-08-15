-- A simple headcount, not a per-child guest record -- researched against real
-- competitor RSVP tools (Zola/WithJoy/RSVPify) which mostly ask "how many
-- kids' meals needed" rather than tracking each child by name.
ALTER TABLE guests
  ADD COLUMN kids_meal_count INTEGER NOT NULL DEFAULT 0;
