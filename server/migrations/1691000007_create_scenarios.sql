CREATE TABLE scenarios (
  id         SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name       VARCHAR(120) NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scenarios_dates_ordered CHECK (end_date >= start_date)
);

CREATE INDEX idx_scenarios_account_id ON scenarios(account_id);
