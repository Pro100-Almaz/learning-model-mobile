import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { useSignOut } from '@/hooks/useSignOut';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { useLanguage } from '@/lib/i18n/useLanguage';
import type { AppLanguage } from '@/lib/i18n';

/** Settings screen: preferences (language) + logout. Pushed from Profile. */
export default function SettingsScreen() {
  const handleSignOut = useSignOut();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, setLanguage, languages, labels } = useLanguage();

  const [languageOpen, setLanguageOpen] = useState(false);

  // The sheet is no longer a <Modal>, so the Android back button would pop the
  // whole screen instead of dismissing it. Intercept it while it's open.
  useEffect(() => {
    if (!languageOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setLanguageOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [languageOpen]);

  const chooseLanguage = (lang: AppLanguage) => {
    void setLanguage(lang);
    setLanguageOpen(false);
  };

  return (
    <View className="flex-1 bg-surface-app">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-line-200 bg-surface-app">
        <View className="min-h-[44px] flex-row items-center px-4 pb-3 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="-ml-2 h-11 w-11 items-center justify-center rounded-pill active:bg-surface-tint">
            <Ionicons name="chevron-back" size={24} color={COLORS.ink900} />
          </Pressable>
          <Text className="flex-1 font-display text-[24px] text-ink-900" numberOfLines={1}>
            {t('profile.menu.settings')}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 gap-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Settings items */}
        <View style={SHADOW_SOFT} className="rounded-lg bg-white px-2 py-1">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('profile.menu.language')}
            onPress={() => setLanguageOpen(true)}
            className="flex-row items-center gap-3 rounded-md px-3 py-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-md bg-blue-50">
              <Ionicons name="language-outline" size={20} color={COLORS.blue600} />
            </View>
            <Text className="flex-1 font-bodyBold text-base text-ink-900">
              {t('profile.menu.language')}
            </Text>
            <Text className="font-body text-[13px] text-ink-500">{labels[language]}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.ink300} />
          </PressableScale>
        </View>
      </ScrollView>

      {/* Logout — pinned to the bottom of the screen, regardless of content */}
      <View className="px-4 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('profile.logout')}
          onPress={handleSignOut}
          style={SHADOW_SOFT}
          className="flex-row items-center justify-center gap-2 rounded-lg bg-white py-4">
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text className="font-bodyBold text-base" style={{ color: '#FF3B30' }}>
            {t('profile.logout')}
          </Text>
        </PressableScale>
      </View>

      {/*
        Language picker. Deliberately an in-screen overlay rather than a
        <Modal>: on Android/Fabric the modal host hands its React content a 0×0
        layout, so the sheet both collapses (invisible, since `transparent`
        makes Android clear FLAG_DIM_BEHIND) and stops receiving touches —
        Android won't dispatch to children drawn outside their parent's bounds.
        The screen owns its header (`headerShown: false`), so an absolutely
        positioned overlay covers everything a dialog would have.
      */}
      {languageOpen ? (
        <Pressable
          // No `elevation` here: the overlay is a sibling of the ScrollView and
          // comes later in the tree, so it already paints above the cards
          // inside it — and an elevation shadow on a full-screen view darkens
          // the scrim's left/right edges.
          className="absolute bottom-0 left-0 right-0 top-0 z-10 justify-end bg-black/40"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => setLanguageOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom + 16 }}
            className="gap-2 rounded-t-xl bg-surface-app px-4 pt-4">
            <Text className="mb-1 px-1 font-display text-lg text-ink-900">
              {t('profile.language.title')}
            </Text>
            {languages.map((lang) => {
              const active = lang === language;
              return (
                <Pressable
                  key={lang}
                  onPress={() => chooseLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={labels[lang]}
                  className={`flex-row items-center justify-between rounded-md px-4 py-3.5 ${
                    active ? 'bg-surface-tint' : 'active:bg-surface-field'
                  }`}>
                  <Text className="font-bodyBold text-base text-ink-900">{labels[lang]}</Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.blue500} />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}
