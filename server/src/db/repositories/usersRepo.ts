import { Pool } from 'pg';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(pool: Pool, email: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function getUserById(pool: Pool, id: number): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * An object rather than two positional strings — `(email, passwordHash)` and
 * `(passwordHash, email)` are both valid to the compiler, and getting them the
 * wrong way round would store the hash as the address.
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
}

export async function createUser(pool: Pool, data: CreateUserData): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [data.email, data.passwordHash]
  );
  return result.rows[0];
}
