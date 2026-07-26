import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from './useApiClient';
import { useProfile } from './useProfile';
import { DEV_BYPASS_AUTH } from '@/lib/devFlags';
import {
  MOCK_FRIENDS,
  MOCK_RECEIVED_REQUESTS,
  MOCK_SENT_REQUESTS,
} from '@/lib/mock/friends';
import {
  toFriend,
  toFriendRequest,
  type Friend,
  type FriendProfileApi,
  type FriendRequest,
  type FriendshipApi,
  type RequestDirection,
} from '@/lib/friendships';

// Mounted at /api/v1/friendships/ on the backend (conf/urls.py); EXPO_PUBLIC_API_BASE_URL
// already carries the /api/v1 prefix, same as the other hooks in this folder.
const FRIENDSHIPS_PATH = '/friendships/';
const friendsPath = (profileId: number) => `/friendships/friends/${profileId}/`;
const requestsPath = (profileId: number, direction: RequestDirection) =>
  `/friendships/requests/${profileId}/?direction=${direction}`;

export const friendsQueryKey = (profileId?: number) => ['friends', profileId] as const;
export const friendRequestsQueryKey = (
  profileId?: number,
  direction?: RequestDirection
) => ['friend-requests', profileId, direction] as const;

/**
 * The current user's StudentProfile id. Every friendships endpoint is keyed by it
 * and it only reaches the app through `GET /profile/`, so the queries below stay
 * disabled until the profile has resolved.
 */
export function useMyProfileId(): number | undefined {
  return useProfile().data?.id;
}

/** Accepted friends (GET /friendships/friends/<profile_id>/). */
export function useFriends() {
  const api = useApiClient();
  const profileId = useMyProfileId();

  return useQuery({
    queryKey: friendsQueryKey(profileId),
    enabled: profileId != null,
    queryFn: DEV_BYPASS_AUTH
      ? async () => MOCK_FRIENDS
      : async () => {
          const raw = await api.get<FriendProfileApi[]>(friendsPath(profileId!));
          return raw.map(toFriend);
        },
  });
}

/** Pending requests in one direction (GET /friendships/requests/<profile_id>/). */
export function useFriendRequests(direction: RequestDirection) {
  const api = useApiClient();
  const profileId = useMyProfileId();

  return useQuery({
    queryKey: friendRequestsQueryKey(profileId, direction),
    enabled: profileId != null,
    queryFn: DEV_BYPASS_AUTH
      ? async () => (direction === 'sent' ? MOCK_SENT_REQUESTS : MOCK_RECEIVED_REQUESTS)
      : async () => {
          const raw = await api.get<FriendshipApi[]>(requestsPath(profileId!, direction));
          return raw.map((f) => toFriendRequest(f, direction));
        },
  });
}

// Both lists shift on every mutation: accepting moves a row out of "received"
// and into "friends", and sending can auto-accept when the other side already
// asked us. Invalidating by prefix covers every profileId/direction variant.
function useInvalidateFriendships() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
  };
}

/** Send a friend request (POST /friendships/). Sender is the authenticated user. */
export function useSendFriendRequest() {
  const api = useApiClient();
  const invalidate = useInvalidateFriendships();

  return useMutation({
    mutationFn: (receiverId: number) =>
      api.post<FriendshipApi>(FRIENDSHIPS_PATH, { receiver_id: receiverId }),
    onSuccess: invalidate,
  });
}

/** Accept or reject a received request (PATCH /friendships/). */
export function useRespondToFriendRequest() {
  const api = useApiClient();
  const invalidate = useInvalidateFriendships();

  return useMutation({
    mutationFn: (vars: { requestId: number; action: 'accept' | 'reject' }) =>
      api.patch<FriendshipApi>(FRIENDSHIPS_PATH, {
        id: vars.requestId,
        action: vars.action,
      }),
    onSuccess: invalidate,
  });
}

/** Withdraw a request we sent (DELETE /friendships/). */
export function useCancelFriendRequest() {
  const api = useApiClient();
  const invalidate = useInvalidateFriendships();

  return useMutation({
    mutationFn: (requestId: number) =>
      api.del<void>(FRIENDSHIPS_PATH, { id: requestId }),
    onSuccess: invalidate,
  });
}

/**
 * Look up one person by profile id across the lists the Friends tab already
 * fetched. The backend has no "fetch another student's profile" endpoint, so the
 * detail screen reads from these caches rather than making its own request.
 */
export function usePerson(profileId: number | undefined): {
  person: Friend | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const friends = useFriends();
  const received = useFriendRequests('received');
  const sent = useFriendRequests('sent');

  const person = useMemo(() => {
    if (profileId == null) return undefined;
    const pool: Friend[] = [
      ...(friends.data ?? []),
      ...(received.data ?? []).map((r) => r.user),
      ...(sent.data ?? []).map((r) => r.user),
    ];
    return pool.find((p) => p.id === profileId);
  }, [profileId, friends.data, received.data, sent.data]);

  return {
    person,
    isLoading: friends.isLoading || received.isLoading || sent.isLoading,
    isError: friends.isError || received.isError || sent.isError,
  };
}
