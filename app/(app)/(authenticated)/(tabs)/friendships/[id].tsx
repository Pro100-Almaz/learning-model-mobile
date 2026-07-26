import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/friends/Avatar';
import { ScreenHeader } from '@/components/learn/ScreenHeader';
import { StatCard } from '@/components/home/StatCard';
import { usePerson } from '@/hooks/useFriendships';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

/**
 * A friend's profile. Reached by tapping a row on the Friends tab; the header's
 * back chevron pops back to the friends list. The name comes from the friends /
 * requests lists the tab already fetched — the backend has no endpoint for
 * reading another student's profile, so the stats below stay placeholders.
 */
export default function FriendProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Route params are always strings; the API keys profiles by number.
  const profileId = Number(id);
  const { person, isLoading } = usePerson(Number.isFinite(profileId) ? profileId : undefined);

  return (
    <View className="flex-1 bg-surface-app" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={person?.username ?? 'Профиль'} onBack={() => router.back()} />

      {isLoading && !person ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.blue500} />
        </View>
      ) : person ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 gap-5"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Header card */}
          <View style={SHADOW_SOFT} className="items-center gap-3 rounded-lg bg-white p-6">
            <View className="items-center justify-center rounded-pill border-2 border-blue-200 p-1">
              <Avatar username={person.username} id={person.id} size={88} />
            </View>
            <Text className="font-display text-2xl text-ink-900">{person.username}</Text>
          </View>

          {/* Placeholder stats until a public profile endpoint exists */}
          <View className="flex-row gap-3">
            <StatCard label="Streak" value="8" unit="күн" icon="flame" />
            <StatCard label="Сабақ" value="42" icon="book-outline" />
            <StatCard label="Орын" value="#12" icon="trophy-outline" />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="font-body text-base text-ink-500">Қолданушы табылмады</Text>
        </View>
      )}
    </View>
  );
}
