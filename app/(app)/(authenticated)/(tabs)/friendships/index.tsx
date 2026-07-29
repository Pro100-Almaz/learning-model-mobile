import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';

import { FriendsScreen, type FriendsTab } from '@/components/friends/FriendsScreen';
import {
  useCancelFriendRequest,
  useFriendRequests,
  useFriends,
  useRespondToFriendRequest,
} from '@/hooks/useFriendships';
import type { RequestDirection } from '@/lib/friendships';

/**
 * Friends tab root. Owns UI state (active tab, request direction, search) and
 * binds the friendships API to the screen: the lists come from React Query and
 * accept/reject/cancel are mutations that invalidate both lists on success. Row
 * taps push the friend's profile screen.
 */
export default function FriendshipsRoute() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
  const [requestDir, setRequestDir] = useState<RequestDirection>('received');
  const [query, setQuery] = useState('');

  const friendsQuery = useFriends();
  // Only the visible direction is fetched; switching the toggle swaps the query key.
  const requestsQuery = useFriendRequests(requestDir);

  const respond = useRespondToFriendRequest();
  const cancel = useCancelFriendRequest();

  const openPerson = useCallback(
    (profileId: number) => {
      router.push(`/(app)/(authenticated)/(tabs)/friendships/${profileId}`);
    },
    [router]
  );

  const accept = useCallback(
    (requestId: number) => respond.mutate({ requestId, action: 'accept' }),
    [respond]
  );
  const reject = useCallback(
    (requestId: number) => respond.mutate({ requestId, action: 'reject' }),
    [respond]
  );
  const cancelRequest = useCallback((requestId: number) => cancel.mutate(requestId), [cancel]);

  const active = activeTab === 'friends' ? friendsQuery : requestsQuery;

  // The row whose buttons are mid-flight: mutation variables are the request id
  // for cancel and an object for respond.
  const busyRequestId = respond.isPending
    ? respond.variables?.requestId
    : cancel.isPending
      ? cancel.variables
      : undefined;

  return (
    <FriendsScreen
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      requestDir={requestDir}
      onChangeRequestDir={setRequestDir}
      query={query}
      onChangeQuery={setQuery}
      friends={friendsQuery.data ?? []}
      requests={requestsQuery.data ?? []}
      isLoading={active.isLoading}
      isError={active.isError}
      onRetry={() => active.refetch()}
      busyRequestId={busyRequestId}
      onOpenPerson={openPerson}
      onCancel={cancelRequest}
      onAccept={accept}
      onReject={reject}
    />
  );
}
