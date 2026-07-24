import { Image, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/learn/ScreenHeader';
import { StatCard } from '@/components/home/StatCard';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import { findPersonById } from '@/lib/mock/friends';

/**
 * A friend's profile. Reached by tapping a row on the Friends tab; the header's
 * back chevron pops back to the friends list. Data is mock for now.
 */
export default function FriendProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const person = findPersonById(id);

  return (
    <View className="flex-1 bg-surface-app" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={person?.username ?? 'Профиль'} onBack={() => router.back()} />

      {person ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 gap-5"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Header card */}
          <View style={SHADOW_SOFT} className="items-center gap-3 rounded-lg bg-white p-6">
            <View className="h-24 w-24 items-center justify-center rounded-pill border-2 border-blue-200 p-1">
              <Image source={{ uri: person.avatarUrl }} className="h-full w-full rounded-pill" />
            </View>
            <Text className="font-display text-2xl text-ink-900">{person.username}</Text>
          </View>

          {/* Placeholder stats until the profile endpoint is wired */}
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
