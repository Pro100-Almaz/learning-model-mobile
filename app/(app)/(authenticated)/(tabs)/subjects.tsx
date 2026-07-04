import {View, Text} from 'react-native';


export default function SubjectsRoute() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold text-gray-800">Subjects</Text>
      <Text className="mt-2 text-base text-gray-600">
        This is the Subjects tab content.
      </Text>
    </View>
  );
}