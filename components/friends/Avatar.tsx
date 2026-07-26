import { Text, View } from 'react-native';

import { initial } from '@/lib/friendships';

// StudentProfile has no image field on the backend, so rows show initials. The
// colour is picked from the profile id so a given person always looks the same.
const PALETTE = ['#2F6BFF', '#15C7A9', '#FFB020', '#7C5CFF', '#EF4444', '#16B364'] as const;

interface AvatarProps {
  username: string;
  /** Profile id — drives the colour so it stays stable per person. */
  id: number;
  size?: number;
}

/** Round initials avatar standing in for a profile picture. */
export function Avatar({ username, id, size = 48 }: AvatarProps) {
  const backgroundColor = PALETTE[Math.abs(id) % PALETTE.length];

  return (
    <View
      className="items-center justify-center rounded-pill"
      style={{ width: size, height: size, backgroundColor }}>
      <Text className="font-display text-white" style={{ fontSize: Math.round(size * 0.42) }}>
        {initial(username)}
      </Text>
    </View>
  );
}
