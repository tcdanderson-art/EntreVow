ALTER TABLE guests
  ADD COLUMN rsvp_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN rsvp_note TEXT,
  ADD COLUMN rsvp_responded_at TIMESTAMPTZ;

ALTER TABLE guests
  ADD CONSTRAINT guests_rsvp_status_check CHECK (rsvp_status IN ('pending', 'attending', 'declined'));
