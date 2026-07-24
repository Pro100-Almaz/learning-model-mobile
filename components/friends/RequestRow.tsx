import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS } from '@/lib/onboarding-theme';
import type { FriendRequest } from '@/lib/mock/friends';

const RED = '#EF4444';

interface RequestRowProps {
  request: FriendRequest;
  onOpen: (id: string) => void;
  onCancel: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  /** Draw a hairline divider under the row (omit on the last row of the card). */
  showDivider?: boolean;
}

/**
 * A pending request row inside the grouped card. `sent` shows a Cancel button;
 * `received` shows reject (✕) and accept (✓) circular buttons. Tapping the
 * avatar/name opens the person's profile.
 */
export function RequestRow({
  request,
  onOpen,
  onCancel,
  onAccept,
  onReject,
  showDivider,
}: RequestRowProps) {
  const { user, direction } = request;

  return (
    <View
      className={`flex-row items-center gap-3 px-3 py-3 ${
        showDivider ? 'border-b border-line-200' : ''
      }`}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={user.username}
        onPress={() => onOpen(user.id)}
        className="flex-1 flex-row items-center gap-3">
        <Image source={{ uri: user.avatarUrl }} className="h-12 w-12 rounded-pill" />
        <Text className="flex-1 font-bodyBold text-base text-ink-900" numberOfLines={1}>
          {user.username}
        </Text>
      </PressableScale>

      {direction === 'sent' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Сұранысты болдырмау"
          onPress={() => onCancel(request.id)}
          hitSlop={6}
          className="rounded-pill bg-surface-field px-4 py-2 active:opacity-70">
          <Text className="font-bodyBold text-sm text-ink-700">Болдырмау</Text>
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Қабылдамау"
            onPress={() => onReject(request.id)}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-pill bg-surface-field active:opacity-70">
            <Ionicons name="close" size={22} color={RED} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Қабылдау"
            onPress={() => onAccept(request.id)}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-pill active:opacity-70"
            style={{ backgroundColor: COLORS.success500 }}>
            <Ionicons name="checkmark" size={22} color={COLORS.white} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
