import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const SESSION_KEY = 'inverge_session';

// Session token accessor. Browser: localStorage. Server: undefined (public reads only).
export function getSessionToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(SESSION_KEY) ?? undefined;
}

export function setSessionToken(token: string): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getSessionToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
};

// Typed client generated from inverge-api's OpenAPI spec (pnpm gen:api).
export const api = createClient<paths>({ baseUrl: API_URL });
api.use(authMiddleware);
