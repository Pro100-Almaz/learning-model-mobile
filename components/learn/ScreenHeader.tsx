import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/onboarding-theme';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  breadcrumb?: BreadcrumbItem[];
  onCrumb?: (pop: number) => void;
  /** Trailing node (search / action). Defaults to a search glyph when omitted. */
  right?: ReactNode;
  /** Hide the default search button (Subjects top level shows it, e.g.). */
  onSearch?: () => void;
}

/**
 * Sticky screen header: back chevron + title + optional breadcrumb row and a
 * trailing search/action. Stays pinned while the list scrolls under it.
 * See docs/subject_lesson_pages.md §1, §5.
 */
export function ScreenHeader({ title, onBack, breadcrumb, onCrumb, right, onSearch }: ScreenHeaderProps) {
  return (
    <View className="border-b border-line-200 bg-surface-app px-4 pb-3 pt-2">
      <View className="min-h-[44px] flex-row items-center">
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Артқа"
            className="-ml-2 h-11 w-11 items-center justify-center rounded-pill active:bg-surface-tint">
            <Ionicons name="chevron-back" size={24} color={COLORS.ink900} />
          </Pressable>
        ) : null}

        <Text
          className="flex-1 font-display text-[24px] text-ink-900"
          numberOfLines={1}>
          {title}
        </Text>

        {right ??
          (onSearch ? (
            <Pressable
              onPress={onSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Іздеу"
              className="h-11 w-11 items-center justify-center rounded-pill active:bg-surface-tint">
              <Ionicons name="search" size={22} color={COLORS.ink700} />
            </Pressable>
          ) : null)}
      </View>

      {breadcrumb && breadcrumb.length > 0 ? (
        <View className="mt-1">
          <Breadcrumb items={breadcrumb} onNavigate={onCrumb} />
        </View>
      ) : null}
    </View>
  );
}
