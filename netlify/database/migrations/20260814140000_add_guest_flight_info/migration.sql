-- arrival_time is a wall-clock "YYYY-MM-DDTHH:MM" string, same convention as
-- itinerary_items.start_time (see 20260810180000_itinerary_times_to_text) --
-- it's the guest's local arrival time as they'd read it off a boarding pass,
-- not an instant tied to any timezone.
ALTER TABLE guests
  ADD COLUMN flight_number TEXT,
  ADD COLUMN arrival_time TEXT;
