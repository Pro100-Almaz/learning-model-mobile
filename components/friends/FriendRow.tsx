import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS } from '@/lib/onboarding-theme';
import type { Friend } from '@/lib/friendships';

interface FriendRowProps {
  friend: Friend;
  onPress: (id: number) => void;
  /** Draw a hairline divider under the row (omit on the last row of the card). */
  showDivider?: boolean;
}

/** Tappable friend row inside the grouped card: avatar + username + chevron. */
export function FriendRow({ friend, onPress, showDivider }: FriendRowProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={friend.username}
      onPress={() => onPress(friend.id)}
      className={`flex-row items-center gap-3 rounded-md px-3 py-3 ${
        showDivider ? 'border-b border-line-200' : ''
      }`}>
      <Avatar username={friend.username} id={friend.id} />
      <Text className="flex-1 font-bodyBold text-base text-ink-900" numberOfLines={1}>
        {friend.username}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.ink300} />
    </PressableScale>
  );
}
