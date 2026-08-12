CREATE TABLE transaction_categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
