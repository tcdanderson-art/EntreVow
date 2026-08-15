-- Feedback for the pre-launch beta program (a handful of comped real weddings).
-- trouble_items is which checklist items the submitter flagged as having a
-- problem, not a full works/doesn't-work matrix -- an unchecked item is
-- presumed fine, which keeps the form quick enough that people actually fill
-- it in during a busy wedding week.
CREATE TABLE beta_feedback (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('couple', 'guest')),
  trouble_items TEXT[] NOT NULL DEFAULT '{}',
  comments TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX beta_feedback_wedding_id_idx ON beta_feedback(wedding_id);
