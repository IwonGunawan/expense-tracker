import type { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
}

export type AuthedRequest = Request & { user: AuthUser };
