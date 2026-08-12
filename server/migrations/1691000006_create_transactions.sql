CREATE TABLE transactions (
  id          SERIAL PRIMARY KEY,
  account_id  INTEGER NOT NULL REFERENCES accounts(id)               ON DELETE CASCADE,
  person_id   INTEGER NOT NULL REFERENCES people(id)                 ON DELETE RESTRICT,
  category_id INTEGER NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount <> 0),
  description TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account_id  ON transactions(account_id);
CREATE INDEX idx_transactions_person_id   ON transactions(person_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_occurred_on ON transactions(occurred_on);
