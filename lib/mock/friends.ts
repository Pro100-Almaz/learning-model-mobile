// Mock fixtures for the Friends (Достар) tab, used *only* when DEV_BYPASS_AUTH is
// on — that flag promises the app never touches the backend, so the friendships
// hooks serve these instead of fetching. Real runs go through hooks/useFriendships.ts.

import type { Friend, FriendRequest } from '@/lib/friendships';

export const MOCK_FRIENDS: Friend[] = [
  { id: 101, username: 'aigerim_k' },
  { id: 102, username: 'daniyar.t' },
  { id: 103, username: 'zhanel_99' },
  { id: 104, username: 'arman_bek' },
  { id: 105, username: 'madina.s' },
  { id: 106, username: 'nurlan_qz' },
];

export const MOCK_RECEIVED_REQUESTS: FriendRequest[] = [
  { id: 1, direction: 'received', user: { id: 201, username: 'saliha_m' } },
  { id: 2, direction: 'received', user: { id: 202, username: 'erlan.k' } },
  { id: 3, direction: 'received', user: { id: 203, username: 'dana_777' } },
];

export const MOCK_SENT_REQUESTS: FriendRequest[] = [
  { id: 4, direction: 'sent', user: { id: 301, username: 'timur_a' } },
  { id: 5, direction: 'sent', user: { id: 302, username: 'aliya.zh' } },
];
