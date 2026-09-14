import { useCallback, useContext, useEffect, useRef } from 'react';
import { NavigationContext } from '@react-navigation/native';
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

/**
 * The one way this app reads backend data.
 *
 * Policy: **nothing from the backend is stored.** Every screen that shows server
 * data fetches it again each time it opens. react-query is used only as a
 * request/loading/error state machine — never as a cache the UI can be served
 * from later.
 *
 * Two things are needed for that, and neither is react-query's default:
 *
 * 1. `gcTime: 0` + `staleTime: 0` + `refetchOnMount: 'always'` — the entry is
 *    dropped the moment its last observer unmounts, so re-opening a screen can
 *    never paint a previous visit's data while a refresh runs behind it.
 * 2. A refetch on navigation focus. Tab screens mount once and then stay mounted
 *    for the whole session, so (1) alone would leave them showing whatever they
 *    fetched at app start. Focus is the real "the page opened" signal.
 *
 * Only *local* state (UI language, see lib/i18n) is persisted; that lives in
 * MMKV, not here.
 */

// The closest screen's navigation object, or undefined outside a navigator
// (web layouts, tests). Reading the context directly instead of calling
// `useNavigation()` keeps this hook usable in both cases — `useNavigation`
// throws when there is no navigator above it.
type FocusEmitter = {
  addListener: (type: 'focus', callback: () => void) => () => void;
};

function useRefetchOnFocus(refetch: () => void, enabled: boolean) {
  const navigation = useContext(NavigationContext) as FocusEmitter | undefined;
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!navigation || !enabled) return;
    // Only *re*-focus matters: the mount fetch already covers the first paint,
    // and firing both would put two requests on the wire for one screen open.
    return navigation.addListener('focus', () => refetchRef.current());
  }, [navigation, enabled]);
}

export function useFreshQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const query = useQuery({
    ...options,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const { refetch } = query;
  // `cancelRefetch: false` so a focus that lands while the mount fetch is still
  // in flight joins it instead of aborting it and starting over.
  const refetchOnFocus = useCallback(() => {
    void refetch({ cancelRefetch: false });
  }, [refetch]);

  useRefetchOnFocus(refetchOnFocus, options.enabled !== false);

  return query;
}
