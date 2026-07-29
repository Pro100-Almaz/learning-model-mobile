import { View, ActivityIndicator, Text } from 'react-native';
import { Waitlist } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <View className="mb-10 justify-center items-center">
        <Text className="text-4xl font-bold">{t('soon.title')}</Text>
        <Text className="text-sm text-gray-500">
          {t('soon.body')}
        </Text>
      </View>
      <Waitlist
        appearance={{
          variables: { colorPrimary: '#0d6c9a' },
        }}
        afterJoinWaitlistUrl="/wait"
        signInUrl="/login"
        fallback={<ActivityIndicator />}
      />
    </View>
  );
};
export default Page;
