ALTER TABLE itinerary_items
  ADD COLUMN visible_to_groups TEXT[] NOT NULL DEFAULT ARRAY['general']::TEXT[];
