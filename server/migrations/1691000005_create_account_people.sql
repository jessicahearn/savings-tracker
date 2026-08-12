CREATE TABLE account_people (
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  person_id  INTEGER NOT NULL REFERENCES people(id)   ON DELETE RESTRICT,
  PRIMARY KEY (account_id, person_id)
);
