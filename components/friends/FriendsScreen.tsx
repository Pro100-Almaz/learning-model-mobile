import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from './SearchBar';
import { Segmented } from './Segmented';
import { FriendRow } from './FriendRow';
import { RequestRow } from './RequestRow';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Friend, FriendRequest, RequestDirection } from '@/lib/mock/friends';

export type FriendsTab = 'friends' | 'requests';

interface FriendsScreenProps {
  activeTab: FriendsTab;
  onChangeTab: (tab: FriendsTab) => void;
  requestDir: RequestDirection;
  onChangeRequestDir: (dir: RequestDirection) => void;
  query: string;
  onChangeQuery: (query: string) => void;
  friends: Friend[];
  requests: FriendRequest[];
  onOpenPerson: (id: string) => void;
  onCancel: (requestId: string) => void;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const matches = (name: string, q: string) => name.toLowerCase().includes(q.trim().toLowerCase());

/**
 * Friends (Достар) screen: fixed search + segmented chrome at the top with a
 * scrolling list underneath. Rows are stacked flush inside a single grouped
 * card (like the profile menu). The Requests tab swaps in received/sent
 * requests with a second toggle.
 */
export function FriendsScreen({
  activeTab,
  onChangeTab,
  requestDir,
  onChangeRequestDir,
  query,
  onChangeQuery,
  friends,
  requests,
  onOpenPerson,
  onCancel,
  onAccept,
  onReject,
}: FriendsScreenProps) {
  const insets = useSafeAreaInsets();

  const visibleFriends = useMemo(
    () => friends.filter((f) => matches(f.username, query)),
    [friends, query]
  );

  const visibleRequests = useMemo(
    () => requests.filter((r) => r.direction === requestDir && matches(r.user.username, query)),
    [requests, requestDir, query]
  );

  const isEmpty = activeTab === 'friends' ? visibleFriends.length === 0 : visibleRequests.length === 0;
  const emptyText =
    activeTab === 'friends'
      ? 'Дос табылмады'
      : requestDir === 'received'
        ? 'Жаңа сұраныс жоқ'
        : 'Жіберілген сұраныс жоқ';

  return (
    <View className="flex-1 bg-surface-app">
      {/* Fixed chrome */}
      <View className="gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <Text className="font-display text-[28px] text-ink-900">Достар</Text>

        <SearchBar value={query} onChangeText={onChangeQuery} />

        <Segmented<FriendsTab>
          options={[
            { value: 'friends', label: 'Достар тізімі' },
            { value: 'requests', label: 'Сұраныстар' },
          ]}
          value={activeTab}
          onChange={onChangeTab}
        />

        {activeTab === 'requests' ? (
          <Segmented<RequestDirection>
            options={[
              { value: 'received', label: 'Келген' },
              { value: 'sent', label: 'Жіберілген' },
            ]}
            value={requestDir}
            onChange={onChangeRequestDir}
          />
        ) : null}
      </View>

      {/* Scrolling grouped card */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {isEmpty ? (
          <EmptyState text={emptyText} />
        ) : (
          <View style={SHADOW_SOFT} className="rounded-lg bg-white px-2 py-1">
            {activeTab === 'friends'
              ? visibleFriends.map((friend, i) => (
                  <FriendRow
                    key={friend.id}
                    friend={friend}
                    onPress={onOpenPerson}
                    showDivider={i < visibleFriends.length - 1}
                  />
                ))
              : visibleRequests.map((request, i) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    onOpen={onOpenPerson}
                    onCancel={onCancel}
                    onAccept={onAccept}
                    onReject={onReject}
                    showDivider={i < visibleRequests.length - 1}
                  />
                ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="items-center pt-16">
      <Text className="font-body text-base text-ink-500">{text}</Text>
    </View>
  );
}
