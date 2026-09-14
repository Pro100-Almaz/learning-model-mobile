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

// How many times we send the token before giving up on a single request. On an
// auth failure the backend rejected the token, so we refetch a fresh one and
// resend; after this many failed attempts the error is surfaced to the caller.
const MAX_AUTH_ATTEMPTS = 3;

// Statuses that mean "the token was rejected" — the only errors worth resending
// a fresh token for. Everything else (404/500/network) fails immediately.
const AUTH_FAILURE_STATUSES = new Set([401, 403]);

// Rolling-window circuit breaker. Even with the per-request cap above, the same
// request can be re-fired indefinitely by react-query retries or a screen that
// re-mounts on every error (e.g. OnboardingGate bouncing to onboarding and back
// on a persistent `/profile/` 401 — a valid token the backend keeps rejecting).
// If a single endpoint fails this many times within the window, we stop sending
// and surface the underlying problem (network vs auth) instead of hammering the
// backend forever.
const RATE_LIMIT_MAX_FAILURES = 5;
const RATE_LIMIT_WINDOW_MS = 5000;
// HTTP 429 = "Too Many Requests"; carried on the ApiError we throw when the
// breaker trips, so react-query treats it as a non-retryable 4xx.
const RATE_LIMITED_STATUS = 429;

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
  /** DELETE with an optional body — some endpoints identify the row in the body. */
  del<T>(path: string, body?: unknown): Promise<T>;
}

// Timestamps (ms) of recent *failed* sends, keyed by "METHOD /path". This lives
// at module scope, not inside createApiClient, on purpose: the ApiClient is
// recreated on every render (see hooks/useApiClient.ts), so per-client state
// would reset constantly and never accumulate. Module scope also means the
// window survives screen re-mounts and even a signed-out→signed-in cycle, which
// is exactly the runaway we're capping.
const failureLog = new Map<string, number[]>();
// The status of the most recent failure per endpoint, used only to phrase the
// breaker message as "network problem" vs "auth problem".
const lastFailureStatus = new Map<string, number>();

// Drop timestamps that have aged out of the window and return what's left.
function pruneFailureWindow(key: string): number[] {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const kept = (failureLog.get(key) ?? []).filter((t) => t >= cutoff);
  failureLog.set(key, kept);
  return kept;
}

function recordFailure(key: string, status: number): void {
  const kept = pruneFailureWindow(key);
  kept.push(Date.now());
  failureLog.set(key, kept);
  lastFailureStatus.set(key, status);
}

function clearFailures(key: string): void {
  failureLog.delete(key);
  lastFailureStatus.delete(key);
}

// The message shown once the breaker trips. `status` is the last failure's
// status: 401/403 → the backend keeps rejecting a token (auth problem);
// anything else (0 = network/timeout, 5xx = server) → a connectivity problem.
function breakerMessage(status: number | undefined): string {
  if (status === 401 || status === 403) {
    return "We couldn't verify your account with the server after several tries. This looks like an authentication problem — please try again in a moment, or sign out and back in.";
  }
  return "We couldn't reach the server after several tries. Please check your internet connection and try again in a moment.";
}

export function createApiClient(getToken: GetToken, language?: string): ApiClient {
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
    const key = `${init?.method ?? 'GET'} ${path}`;

    // Circuit breaker: if this endpoint has already failed too many times in the
    // window, stop before sending and surface the underlying problem. We do NOT
    // record this as another failure, so the window drains naturally and normal
    // requests resume once RATE_LIMIT_WINDOW_MS passes without new failures.
    if (pruneFailureWindow(key).length >= RATE_LIMIT_MAX_FAILURES) {
      if (__DEV__) {
        console.warn(
          `[api] circuit breaker OPEN for ${key} — ${RATE_LIMIT_MAX_FAILURES} failures within ${
            RATE_LIMIT_WINDOW_MS / 1000
          }s; not sending`
        );
      }
      throw new ApiError(
        RATE_LIMITED_STATUS,
        breakerMessage(lastFailureStatus.get(key)),
        null
      );
    }

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
        // Nothing this client returns may come from a cache. react-query is
        // configured to keep no data (see app/_layout.tsx), so the platform HTTP
        // cache — OkHttp on Android, NSURLCache on iOS — is the only layer left
        // that could hand a screen a stale 200 for a repeated GET.
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          // Content negotiation: tell the backend which language to serve
          // content in. Bound to the active i18n language (see
          // hooks/useApiClient.ts) so switching language refetches everything.
          ...(language ? { 'Accept-Language': language } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });
    } catch (err) {
      // A timeout surfaces as an AbortError; normalise both it and any other
      // network failure into an ApiError so callers get a consistent shape. Both
      // count as failures (status 0) toward the circuit breaker.
      recordFailure(key, 0);
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
      recordFailure(key, res.status);
      throw new ApiError(res.status, errorMessage(res.status, body), body);
    }
    // A success clears the breaker for this endpoint so an earlier burst of
    // failures doesn't keep counting against a now-recovered request.
    clearFailures(key);
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
        // failure (network, 404, 500, the 429 breaker, …) is not fixable by
        // retrying here, so bail and let the caller surface it.
        if (!(err instanceof ApiError) || !AUTH_FAILURE_STATUSES.has(err.status)) {
          throw err;
        }
        lastError = err;
        if (__DEV__) {
          console.warn(`[api] auth attempt ${n}/${MAX_AUTH_ATTEMPTS} for ${path} → ${err.status}`);
        }
      }
    }

    // Exhausted the fresh-token retries. We deliberately do NOT sign the user
    // out here — a persistent 401 on a valid token is usually a backend problem
    // ("could not resolve user"), and signing out just bounces them through the
    // login screen and straight back into the same failure. Surface the error;
    // the circuit breaker above caps how often we retry the whole cycle.
    throw lastError;
  }

  return {
    get: <T,>(path: string) => request<T>(path),
    patch: <T,>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    post: <T,>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    del: <T,>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'DELETE',
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
  };
}
