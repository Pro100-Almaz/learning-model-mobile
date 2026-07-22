import { Stack } from 'expo-router';

/**
 * Learn flow stack (Subjects → Classes → Modules → Lessons → Lesson Detail).
 * Headers are hidden — each screen renders its own ScreenHeader. Native-stack
 * push/pop gives the slide + back-gesture for free. See docs/subject_lesson_pages.md §3.
 */
export default function SubjectsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="modules" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="lesson" />
      <Stack.Screen name="test" />
      <Stack.Screen name="exam" />
    </Stack>
  );
}
