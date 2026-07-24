import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';

import { FriendsScreen, type FriendsTab } from '@/components/friends/FriendsScreen';
import {
  MOCK_FRIENDS,
  MOCK_REQUESTS,
  type Friend,
  type FriendRequest,
  type RequestDirection,
} from '@/lib/mock/friends';

/**
 * Friends tab root. Owns UI state (active tab, request direction, search) and
 * the (currently mock) data + actions. Request actions mutate local state so
 * the buttons feel real; swap the seeds + handlers for the API once endpoints
 * land. Row taps push the friend's profile screen.
 */
export default function FriendshipsRoute() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
  const [requestDir, setRequestDir] = useState<RequestDirection>('received');
  const [query, setQuery] = useState('');

  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const [requests, setRequests] = useState<FriendRequest[]>(MOCK_REQUESTS);

  const openPerson = useCallback(
    (id: string) => {
      router.push(`/(app)/(authenticated)/(tabs)/friendships/${id}`);
    },
    [router]
  );

  // Mock mutations: drop the request from the list. Accept would also add to
  // friends once the backend confirms it — left out until the endpoint exists.
  const removeRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  return (
    <FriendsScreen
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      requestDir={requestDir}
      onChangeRequestDir={setRequestDir}
      query={query}
      onChangeQuery={setQuery}
      friends={friends}
      requests={requests}
      onOpenPerson={openPerson}
      onCancel={removeRequest}
      onAccept={removeRequest}
      onReject={removeRequest}
    />
  );
}
