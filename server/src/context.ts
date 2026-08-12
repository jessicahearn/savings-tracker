import { Request } from 'express';
import { Pool } from 'pg';

export interface AuthUser {
  id: number;
  email: string;
}

export interface GraphQLContext {
  pool: Pool;
  user: AuthUser | null;
}

export function createContext(req: Request, pool: Pool): GraphQLContext {
  const user = (req.session as any).user || null;
  return {
    pool,
    user,
  };
}
