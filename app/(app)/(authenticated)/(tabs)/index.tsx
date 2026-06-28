import { View, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-2">Qadam</Text>
      <Text className="text-base text-gray-600 text-center">
        Welcome{user?.firstName ? `, ${user.firstName}` : ''}. Your dashboard will live here.
      </Text>
    </View>
  );
}
