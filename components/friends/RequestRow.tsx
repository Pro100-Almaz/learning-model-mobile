import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS } from '@/lib/onboarding-theme';
import type { FriendRequest } from '@/lib/friendships';

const RED = '#EF4444';

interface RequestRowProps {
  request: FriendRequest;
  /** Takes a profile id (the other person); the rest take the request id. */
  onOpen: (profileId: number) => void;
  onCancel: (requestId: number) => void;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  /** Draw a hairline divider under the row (omit on the last row of the card). */
  showDivider?: boolean;
  /** Disables the action buttons while a mutation for this row is in flight. */
  busy?: boolean;
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
  busy = false,
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
        <Avatar username={user.username} id={user.id} />
        <Text className="flex-1 font-bodyBold text-base text-ink-900" numberOfLines={1}>
          {user.username}
        </Text>
      </PressableScale>

      {direction === 'sent' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Сұранысты болдырмау"
          onPress={() => onCancel(request.id)}
          disabled={busy}
          hitSlop={6}
          className={`rounded-pill bg-surface-field px-4 py-2 active:opacity-70 ${
            busy ? 'opacity-50' : ''
          }`}>
          <Text className="font-bodyBold text-sm text-ink-700">Болдырмау</Text>
        </Pressable>
      ) : (
        <View className={`flex-row items-center gap-2 ${busy ? 'opacity-50' : ''}`}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Қабылдамау"
            onPress={() => onReject(request.id)}
            disabled={busy}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-pill bg-surface-field active:opacity-70">
            <Ionicons name="close" size={22} color={RED} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Қабылдау"
            onPress={() => onAccept(request.id)}
            disabled={busy}
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
