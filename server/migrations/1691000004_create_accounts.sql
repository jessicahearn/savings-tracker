CREATE TABLE accounts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
