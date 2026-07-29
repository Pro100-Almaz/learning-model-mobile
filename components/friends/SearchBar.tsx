import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/onboarding-theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Rounded search field used at the top of the Friends tab. */
export function SearchBar({ value, onChangeText, placeholder = 'Іздеу' }: SearchBarProps) {
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-pill bg-surface-field px-4">
      <Ionicons name="search" size={20} color={COLORS.ink500} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.ink300}
        className="flex-1 font-body text-base text-ink-900"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Ionicons
          name="close-circle"
          size={20}
          color={COLORS.ink300}
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  );
}
