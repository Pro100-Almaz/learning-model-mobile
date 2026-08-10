import { Image, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SectionHeader } from '@/components/home/SectionHeader';
import { StatCard } from '@/components/home/StatCard';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { useGamification } from '@/hooks/useGamification';

const SETTINGS = '/(app)/(authenticated)/settings' as const;

const FAKE_PROFILE = {
  grade: '11-сынып',
  stats: {
    streakDays: 12,
    lessonsDone: 84,
    rank: 3,
  },
};

interface MenuRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

const Page = () => {
  const { data: gamification } = useGamification();
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const fullName = [user?.firstName, user?.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ');
  const displayName = fullName || email.split('@')[0] || t('profile.section');

  const menu: MenuRow[] = [
    { icon: 'person-outline', label: t('profile.menu.personalData'), value: FAKE_PROFILE.grade },
    { icon: 'trophy-outline', label: t('profile.menu.achievements'), value: t('profile.badges', { count: 7 }) },
    { icon: 'notifications-outline', label: t('profile.menu.notifications') },
    {
      icon: 'settings-outline',
      label: t('profile.menu.settings'),
      onPress: () => router.push(SETTINGS),
    },
    { icon: 'help-circle-outline', label: t('profile.menu.help') },
  ];

  return (
    <View className="flex-1 bg-surface-app">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 gap-5"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={SHADOW_SOFT} className="items-center gap-3 rounded-lg bg-white p-6">
          <View className="h-24 w-24 items-center justify-center rounded-pill border-2 border-blue-200 p-1">
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="h-full w-full rounded-pill" />
            ) : (
              <View className="h-full w-full items-center justify-center rounded-pill bg-blue-50">
                <Ionicons name="person" size={40} color={COLORS.blue600} />
              </View>
            )}
          </View>
          <View className="items-center">
            <Text className="font-display text-2xl text-ink-900">{displayName}</Text>
            {email ? (
              <Text className="font-body text-[13px] text-ink-500">{email}</Text>
            ) : null}
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3">
          <StatCard
            label={t('profile.stats.streak')}
            value={gamification ? String(gamification.streak.current) : '-'}
            unit={t('profile.unitDays')}
            icon="flame"
            variant="compact"
          />
          <StatCard
            label={t('profile.stats.lessons')}
            value={String(FAKE_PROFILE.stats.lessonsDone)}
            icon="book"
            variant="compact"
          />
          <StatCard
            label={t('profile.stats.rank')}
            value={`#${FAKE_PROFILE.stats.rank}`}
            icon="trophy"
            variant="compact"
          />
        </View>

        {/* Menu */}
        <View className="gap-3">
          <SectionHeader title={t('profile.section')} />
          <View style={SHADOW_SOFT} className="rounded-lg bg-white px-2 py-1">
            {menu.map((row, i) => (
              <PressableScale
                key={row.label}
                accessibilityRole="button"
                accessibilityLabel={row.label}
                onPress={row.onPress ?? (() => {})}
                className={`flex-row items-center gap-3 rounded-md px-3 py-3.5 ${
                  i < menu.length - 1 ? 'border-b border-line-200' : ''
                }`}>
                <View className="h-10 w-10 items-center justify-center rounded-md bg-blue-50">
                  <Ionicons name={row.icon} size={20} color={COLORS.blue600} />
                </View>
                <Text className="flex-1 font-bodyBold text-base text-ink-900">{row.label}</Text>
                {row.value ? (
                  <Text className="font-body text-[13px] text-ink-500">{row.value}</Text>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={COLORS.ink300} />
              </PressableScale>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
