import { Stack } from 'expo-router';

/**
 * Friends (Достар) flow stack: list → a friend's profile. Headers are hidden;
 * each screen renders its own chrome (the profile screen shows a back button).
 * Native-stack push/pop gives the slide + back-gesture for free.
 */
export default function FriendshipsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
