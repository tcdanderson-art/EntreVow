ALTER TABLE weddings
  ADD COLUMN meal_options TEXT[];

ALTER TABLE guests
  ADD COLUMN meal_choice TEXT,
  ADD COLUMN song_request TEXT;
