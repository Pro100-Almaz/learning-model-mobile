import { View, Text, Button, Image, ScrollView } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';

const Page = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View className="flex-1 bg-white p-4">
      <ScrollView className="web:mx-auto">
        <View className="flex-row items-center mb-6">
          <Image source={{ uri: user?.imageUrl }} className="w-20 h-20 rounded-full mr-4" />
          <View className="flex-1">
            <Text className="text-md font-bold mb-1">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Text className="text-base text-gray-600">
              User since {new Date(user?.createdAt!).toDateString()}
            </Text>
          </View>
        </View>

        <Button title="Sign Out" onPress={() => signOut()} color="#FF3B30" />
      </ScrollView>
    </View>
  );
};

export default Page;
