import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black p-4">
      <View className="max-w-md">
        <Text className="text-4xl font-bold text-center mb-4">{t('waitlist.thanks')}</Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
          {t('waitlist.body')}
        </Text>
      </View>
    </View>
  );
};

export default Page;
