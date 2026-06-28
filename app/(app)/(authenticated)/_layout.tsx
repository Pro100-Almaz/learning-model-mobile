import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const Layout = () => {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: '#0d6c9a',
        headerTitleStyle: {
          color: colorScheme === 'dark' ? '#fff' : '#000',
        },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};
export default Layout;
