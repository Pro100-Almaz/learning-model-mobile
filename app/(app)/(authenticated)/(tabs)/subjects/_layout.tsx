import { Stack } from 'expo-router';

/**
 * Entering this stack directly at a nested route (Home's "next lesson" card pushes
 * straight to `subjects/lesson`, deep links do the same) would otherwise build the
 * stack with that screen as its ONLY entry — leaving nothing to pop, so back, the
 * back-swipe and a Subjects tab press all became no-ops. Anchoring the stack to
 * `index` keeps the subjects list underneath.
 */
export const unstable_settings = {
  initialRouteName: 'index',
};

/**
 * Learn flow stack (Subjects → Classes → Modules → Lessons → Lesson Detail).
 * Headers are hidden — each screen renders its own ScreenHeader. Native-stack
 * push/pop gives the slide + back-gesture for free. See docs/subject_lesson_pages.md §3.
 */
export default function SubjectsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Android/Fabric: a re-attached native screen can paint transparent (white)
        // on pop. An explicit opaque background keeps the surface color instead.
        contentStyle: { backgroundColor: '#F5F7FC' },
      }}
    >
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
