// Minimal fetch-based API client for the Qadam backend.
//
// The client is created per-render bound to Clerk's `getToken` (see
// hooks/useApiClient.ts) so every request carries a fresh bearer token.

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Hard ceiling on any single request. Without this, a request that can't reach
// the backend (e.g. an unreachable host) hangs forever, leaving react-query
// stuck in `isPending` and the UI stuck on a loading spinner. With it, the
// request rejects and callers can show an error/retry instead.
const REQUEST_TIMEOUT_MS = 15000;

// How many times we send the token before giving up. On an auth failure the
// backend rejected the token, so we refetch a fresh one and resend; after this
// many failed attempts we force a logout (see `onAuthFailure`).
const MAX_AUTH_ATTEMPTS = 3;

// Statuses that mean "the token was rejected" — the only errors worth resending
// a fresh token for. Everything else (404/500/network) fails immediately.
const AUTH_FAILURE_STATUSES = new Set([401, 403]);

// `skipCache` forces Clerk to mint a brand-new token instead of returning the
// cached (and just-rejected) one — otherwise every retry would resend the same
// failing token.
export type GetToken = (opts?: { skipCache?: boolean }) => Promise<string | null>;

/** Thrown for any non-2xx response; carries the HTTP status for callers. */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Pull a human-readable message out of a DRF-style error body.
function errorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b.detail === 'string') return b.detail;
    const first = Object.values(b)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    if (typeof first === 'string') return first;
  }
  if (typeof body === 'string' && body) return body;
  return `Request failed (${status}).`;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}

/**
 * Called after {@link MAX_AUTH_ATTEMPTS} consecutive auth failures on a single
 * request — i.e. the session's token keeps being rejected. Wire this to Clerk's
 * `signOut` so the user is returned to the sign-in screen.
 */
export type OnAuthFailure = () => void | Promise<void>;

export function createApiClient(getToken: GetToken, onAuthFailure?: OnAuthFailure): ApiClient {
  if (!BASE_URL) {
    throw new Error(
      'Missing EXPO_PUBLIC_API_BASE_URL. Set it in your .env (see DUMMY.env).'
    );
  }

  // Send the token once. `skipCache` forces a fresh token for retries.
  async function attempt<T>(
    path: string,
    init: RequestInit | undefined,
    skipCache: boolean
  ): Promise<T> {
    const token = await getToken(skipCache ? { skipCache: true } : undefined);

    // Dev-only: confirm whether Clerk actually handed us a token. If this logs
    // `token: none`, the problem is client-side (no active session); if it logs
    // a length, the token is being sent and any 401 is the backend rejecting it.
    if (__DEV__) {
      console.log(
        `[api] ${init?.method ?? 'GET'} ${path} — token: ${
          token ? `present (len ${token.length})` : 'none'
        }`
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });
    } catch (err) {
      // A timeout surfaces as an AbortError; normalise both it and any other
      // network failure into an ApiError so callers get a consistent shape.
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError(
          0,
          `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Is the API reachable at ${BASE_URL}?`,
          null
        );
      }
      throw new ApiError(0, `Network request to ${BASE_URL}${path} failed.`, null);
    } finally {
      clearTimeout(timeout);
    }

    const body = await parseBody(res);
    if (!res.ok) {
      // Surface the full server response in dev so failures like a rejected
      // auth token (400/401) show their actual reason in the Metro logs rather
      // than just a status code in the network tab.
      if (__DEV__) {
        console.warn(
          `[api] ${init?.method ?? 'GET'} ${BASE_URL}${path} → ${res.status}`,
          body
        );
      }
      throw new ApiError(res.status, errorMessage(res.status, body), body);
    }
    return body as T;
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let lastError: ApiError | undefined;

    for (let n = 1; n <= MAX_AUTH_ATTEMPTS; n++) {
      try {
        // First send uses Clerk's cached token; retries force a fresh one.
        return await attempt<T>(path, init, n > 1);
      } catch (err) {
        // Only an auth rejection is worth resending a fresh token for. Any other
        // failure (network, 404, 500, …) is not fixable by retrying, so bail.
        if (!(err instanceof ApiError) || !AUTH_FAILURE_STATUSES.has(err.status)) {
          throw err;
        }
        lastError = err;
        if (__DEV__) {
          console.warn(`[api] auth attempt ${n}/${MAX_AUTH_ATTEMPTS} for ${path} → ${err.status}`);
        }
      }
    }

    if (__DEV__) {
      console.warn(`[api] ${MAX_AUTH_ATTEMPTS} auth failures for ${path} — signing out`);
    }
    await onAuthFailure?.();
    throw lastError;
  }

  return {
    get: <T,>(path: string) => request<T>(path),
    patch: <T,>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    post: <T,>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  };
}
