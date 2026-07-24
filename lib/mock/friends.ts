// Mock data for the Friends (Достар) tab. These local types + fixtures stand in
// until the real endpoints are wired; swap the arrays for API calls and keep the
// shapes (or adjust the shapes to match the backend and update consumers).

export interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
}

/** A pending friend request, tagged by who initiated it. */
export type RequestDirection = 'received' | 'sent';

export interface FriendRequest {
  id: string;
  /** The other person in the request (not the current user). */
  user: Friend;
  direction: RequestDirection;
}

const avatar = (n: number) => `https://i.pravatar.cc/200?img=${n}`;

export const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', username: 'aigerim_k', avatarUrl: avatar(5) },
  { id: 'f2', username: 'daniyar.t', avatarUrl: avatar(12) },
  { id: 'f3', username: 'zhanel_99', avatarUrl: avatar(20) },
  { id: 'f4', username: 'arman_bek', avatarUrl: avatar(33) },
  { id: 'f5', username: 'madina.s', avatarUrl: avatar(45) },
  { id: 'f6', username: 'nurlan_qz', avatarUrl: avatar(51) },
];

export const MOCK_REQUESTS: FriendRequest[] = [
  // Received — waiting on the current user to accept/reject.
  { id: 'r1', direction: 'received', user: { id: 'u10', username: 'saliha_m', avatarUrl: avatar(9) } },
  { id: 'r2', direction: 'received', user: { id: 'u11', username: 'erlan.k', avatarUrl: avatar(15) } },
  { id: 'r3', direction: 'received', user: { id: 'u12', username: 'dana_777', avatarUrl: avatar(23) } },
  // Sent — the current user asked, waiting on the receiver.
  { id: 'r4', direction: 'sent', user: { id: 'u20', username: 'timur_a', avatarUrl: avatar(60) } },
  { id: 'r5', direction: 'sent', user: { id: 'u21', username: 'aliya.zh', avatarUrl: avatar(47) } },
];

/** Look up a person by id across friends and request users (for the profile page). */
export function findPersonById(id: string): Friend | undefined {
  const friend = MOCK_FRIENDS.find((f) => f.id === id);
  if (friend) return friend;
  return MOCK_REQUESTS.map((r) => r.user).find((u) => u.id === id);
}
