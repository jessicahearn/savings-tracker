import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

/**
 * The development fallback is a literal in a public repository, so anyone could
 * use it to forge a signed session cookie. That is harmless on a laptop and a
 * full authentication bypass in production, so production has to supply its own
 * and we refuse to start without it rather than quietly falling back.
 */
function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET must be set when NODE_ENV=production. Refusing to start with ' +
        'the development secret, which is published in this repository.'
    );
  }

  return 'dev-secret-change-in-prod';
}

export function createSessionMiddleware(pool: Pool) {
  const PostgresStore = ConnectPgSimple(session);

  return session({
    store: new PostgresStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: sessionSecret(),
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
