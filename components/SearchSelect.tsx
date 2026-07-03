import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/onboarding-theme';

export interface SearchSelectOption<T> {
  value: T;
  label: string;
  /** Secondary line shown under the label (e.g. city, threshold). */
  hint?: string;
}

interface SearchSelectProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: SearchSelectOption<T>[];
  placeholder?: string;
  /** Text shown when the filtered option list is empty. */
  emptyLabel?: string;
  disabled?: boolean;
  /** Optional leading icon for the field. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Title shown in the search modal header. */
  searchTitle?: string;
}

/**
 * A tappable field styled to the onboarding design (bg-surface-field wells)
 * that opens a modal with a search box and a scrollable list. Generic over the
 * option value type (string or number).
 */
export default function SearchSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Таңдаңыз…',
  emptyLabel = 'Ештеңе табылмады',
  disabled = false,
  icon,
  searchTitle,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.hint?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function select(next: T) {
    onChange(next);
    close();
  }

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`h-[52px] flex-row items-center gap-2.5 rounded-md px-4 ${
          disabled ? 'bg-line-200/60' : 'bg-surface-field active:opacity-80'
        }`}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={disabled ? COLORS.ink300 : COLORS.blue500}
          />
        ) : null}
        <Text
          numberOfLines={1}
          className={`flex-1 font-body text-base ${
            selected ? 'text-ink-900' : disabled ? 'text-ink-300' : 'text-ink-500'
          }`}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? COLORS.ink300 : COLORS.ink500}
        />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView className="flex-1 bg-surface-app">
          {searchTitle ? (
            <Text className="px-5 pb-1 pt-4 font-display text-lg text-ink-900">
              {searchTitle}
            </Text>
          ) : null}
          <View className="mx-4 mt-3 flex-row items-center gap-2.5 rounded-md bg-surface-field px-4 py-3">
            <Ionicons name="search" size={18} color={COLORS.ink500} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Іздеу…"
              placeholderTextColor={COLORS.ink300}
              autoFocus
              className="flex-1 py-0.5 font-body text-base text-ink-900"
            />
            <Pressable onPress={close} hitSlop={8}>
              <Text className="font-bodyBold text-blue-500">Дайын</Text>
            </Pressable>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 py-2"
            ListEmptyComponent={
              <Text className="p-6 text-center font-body text-ink-300">
                {emptyLabel}
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => select(item.value)}
                  className={`mb-1.5 flex-row items-center justify-between rounded-md px-4 py-3.5 ${
                    isSelected ? 'bg-surface-tint' : 'active:bg-surface-field'
                  }`}>
                  <View className="flex-1 pr-3">
                    <Text className="font-bodyBold text-base text-ink-900">
                      {item.label}
                    </Text>
                    {item.hint ? (
                      <Text className="mt-0.5 font-body text-sm text-ink-500">
                        {item.hint}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.blue500} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
