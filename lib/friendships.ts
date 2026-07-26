// Types + mappers for the Friends (Достар) tab.
//
// The `*Api` interfaces mirror apps/friendships/serializers.py on the backend;
// the mappers below turn them into the shapes the components render. Backend rows
// are direction-agnostic (a Friendship is always from_profile → to_profile), so
// turning one into a `FriendRequest` needs to know which side the current user is
// on — hence the explicit `direction` argument.

/** Friendship.status on the backend. */
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

/** FriendProfileSerializer — the public slice of another student's profile. */
export interface FriendProfileApi {
  id: number;
  username: string | null;
}

/** FriendshipSerializer. */
export interface FriendshipApi {
  id: number;
  from_profile: FriendProfileApi;
  to_profile: FriendProfileApi;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  /** StudentProfile id — what the friendships endpoints are keyed by. */
  id: number;
  username: string;
}

/** Which side of a pending request the current user is on. */
export type RequestDirection = 'received' | 'sent';

export interface FriendRequest {
  /** Friendship row id — what PATCH / DELETE /friendships/ act on. */
  id: number;
  /** The other person in the request, never the current user. */
  user: Friend;
  direction: RequestDirection;
}

/**
 * `StudentProfile.username` is nullable, so fall back to something stable rather
 * than rendering an empty row.
 */
export function displayName(profile: FriendProfileApi): string {
  return profile.username?.trim() || `Оқушы #${profile.id}`;
}

export function toFriend(api: FriendProfileApi): Friend {
  return { id: api.id, username: displayName(api) };
}

export function toFriendRequest(
  api: FriendshipApi,
  direction: RequestDirection
): FriendRequest {
  // The other person is whichever side isn't us: the sender on a received
  // request, the receiver on one we sent.
  const other = direction === 'received' ? api.from_profile : api.to_profile;
  return { id: api.id, user: toFriend(other), direction };
}

/** First letter for the initials avatar; '?' when the name is unusable. */
export function initial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || '?';
}
