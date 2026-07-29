import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import BlurTabBarBackground from '@/components/TabBarBackground.ios';

// https://github.com/EvanBacon/expo-router-forms-components/blob/main/components/ui/Tabs.tsx
export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={
        process.env.EXPO_OS === 'ios'
          ? {
              tabBarActiveTintColor: '#480d9a',
              tabBarInactiveTintColor: '#8E8E93',
              headerShown: true,
              tabBarBackground: BlurTabBarBackground,
              tabBarStyle: {
                position: 'absolute',
              },
            }
          : {
              tabBarActiveTintColor: '#4d13ee',
              tabBarInactiveTintColor: '#8E8E93',
              headerShown: true,
            }
      }>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          // Home renders its own greeting header (TopBar), so hide the nav header.
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: t('tabs.subjects'),
          // The nested learn Stack renders its own ScreenHeader on each screen.
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friendships"
        options={{
          title: 'Достар',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      
    </Tabs>
  );
}
