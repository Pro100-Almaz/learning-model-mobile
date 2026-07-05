import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/onboarding-theme';

export interface BreadcrumbItem {
  label: string;
  /** Number of stack screens to pop when tapped; omit for the current crumb. */
  pop?: number;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Called with the crumb's `pop` count. */
  onNavigate?: (pop: number) => void;
}

/** Tappable hierarchy trail ("Математика / 10-сынып / Алгебра"). */
export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <View className="flex-row items-center">
      {items.map((item, i) => {
        const tappable = item.pop != null && item.pop > 0;
        const last = i === items.length - 1;
        return (
          <View key={`${item.label}-${i}`} className="max-w-[45%] flex-row items-center">
            <Pressable
              disabled={!tappable}
              onPress={() => tappable && onNavigate?.(item.pop!)}
              hitSlop={6}
              className="shrink">
              <Text
                numberOfLines={1}
                className={`text-[12px] ${tappable ? 'text-ink-500' : 'text-ink-700'}`}>
                {item.label}
              </Text>
            </Pressable>
            {!last ? (
              <Ionicons
                name="chevron-forward"
                size={12}
                color={COLORS.ink300}
                style={{ marginHorizontal: 2 }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
