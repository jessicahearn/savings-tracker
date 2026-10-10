CREATE TABLE scenario_events (
  id                  SERIAL PRIMARY KEY,
  scenario_id         INTEGER NOT NULL REFERENCES scenarios(id)              ON DELETE CASCADE,
  person_id           INTEGER NOT NULL REFERENCES people(id)                 ON DELETE RESTRICT,
  category_id         INTEGER NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
  amount              NUMERIC(12,2) NOT NULL CHECK (amount <> 0),
  description         TEXT,
  start_date          DATE NOT NULL,
  end_date            DATE,
  recurrence_interval INTEGER,
  recurrence_unit     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One-time vs recurring is a database-level fact rather than an application
  -- convention: interval and unit are either both present (recurring) or both
  -- absent (one-time). Nothing can store a half-specified recurrence.
  CONSTRAINT scenario_events_recurrence_paired CHECK (
    (recurrence_interval IS NULL AND recurrence_unit IS NULL) OR
    (recurrence_interval IS NOT NULL AND recurrence_unit IS NOT NULL)
  ),

  CONSTRAINT scenario_events_interval_positive CHECK (
    recurrence_interval IS NULL OR recurrence_interval > 0
  ),

  -- Mirrors the RecurrenceUnit enum in schema.graphql and the union type in
  -- src/lib/recurrence.ts.
  CONSTRAINT scenario_events_unit_valid CHECK (
    recurrence_unit IS NULL OR recurrence_unit IN ('DAY', 'WEEK', 'MONTH', 'YEAR')
  ),

  CONSTRAINT scenario_events_dates_ordered CHECK (
    end_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX idx_scenario_events_scenario_id ON scenario_events(scenario_id);
CREATE INDEX idx_scenario_events_person_id   ON scenario_events(person_id);
CREATE INDEX idx_scenario_events_category_id ON scenario_events(category_id);
