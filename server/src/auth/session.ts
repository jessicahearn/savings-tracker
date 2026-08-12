import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

export function createSessionMiddleware(pool: Pool) {
  const PostgresStore = ConnectPgSimple(session);

  return session({
    store: new PostgresStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  });
}
