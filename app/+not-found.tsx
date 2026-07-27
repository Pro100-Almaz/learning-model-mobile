import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <View className="flex-1 items-center justify-center p-5">
        <Text>{t('notFound.title')}</Text>
        <Link href="/login" className="mt-4 py-4">
          <Text className="text-primary">{t('notFound.backToLogin')}</Text>
        </Link>
      </View>
    </>
  );
}
