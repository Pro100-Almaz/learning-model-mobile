import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createApiClient, type ApiClient } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/useLanguage';

/**
 * Returns an API client bound to the current Clerk session. Every request it
 * makes fetches a fresh token via Clerk's `getToken`.
 *
 * The client no longer signs the user out on repeated auth failures — a valid
 * token that the backend keeps rejecting is a server-side problem, not a stale
 * session, so it surfaces the error instead (see lib/api.ts circuit breaker).
 *
 * It's also bound to the active UI language so every request carries an
 * `Accept-Language` header; switching language rebuilds the client and lets
 * react-query refetch backend content in the new language.
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  const { language } = useLanguage();
  return useMemo(
    () => createApiClient((opts) => getToken(opts), language),
    [getToken, language]
  );
}
