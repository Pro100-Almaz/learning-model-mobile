Qadam Lesson Flow — Claude Code Handoff (React Native /
Expo) 
Full Subject → Class → Unit → Lesson → Lesson Detail navigation for the Qadam learning app. Interactive preview: ui_kits
mobile/lessons/index.html (Design System tab → “Qadam App” → Lesson Flow). Built entirely on the Qadam design system;
this doc maps it to an existing RN project. 
Stack assumed: Expo SDK 50+, expo-router (or React Navigation native-stack), nativewind v4, react-native-svg, expo
linear-gradient, lucide-react-native, TypeScript. Reuses the token port from earlier handoffs (theme/tokens.ts +
tailwind.config.js). 
Screens (visual behavior) 
Subjects — 2-col grid of SubjectCards (icon tile, class count, progress bar). Loads with a skeleton. Tap → Classes.
Classes — list of ClassCards (grade, units·lessons, progress badge + bar). Empty state when a subject has no classes. Tap →
Units.
Units — class-progress summary card (ring) + list of numbered UnitCards (title, description, done/total, progress, locked
variant). Tap → Lessons.
Lessons — unit summary + list of LessonCards driven by status: completed (green check), in-progress (play + mini progress
bar + %), available (play), locked (lock, disabled). Tap → Detail.
Lesson Detail — eyebrow + title + meta (min · steps), video/content placeholder, “continue” progress card (if started),
summary, key-concepts list, and a sticky action bar (Жаттығу / Бастау·Жалғастыру). 
Every screen has: a ScreenHeader (back chevron + title + search) and, below the top level, a Breadcrumb (“Математика / 10-сынып /
Алгебра”) whose crumbs pop the stack. Loading = skeleton rows; empty = friendly EmptyState. 
1. Component structure 
<LessonStack> (native-stack navigator)
├─ SubjectsScreen → <ScreenHeader/> + <FlatList numColumns={2} renderItem={SubjectCard}/>
├─ ClassesScreen → <ScreenHeader crumbs/> + <FlatList renderItem={ClassCard}/> | <EmptyState/>
├─ UnitsScreen → <ScreenHeader crumbs/> + <ClassSummaryCard/> + <FlatList renderItem={UnitCard}/>├─ LessonsScreen → <ScreenHeader crumbs/> + <UnitSummaryCard/> + <FlatList renderItem={LessonCard}/>└─ LessonDetailScreen → <ScreenHeader crumbs/> + <VideoPlaceholder/> + <ContinueCard/> + <ConceptList/>
Reusable components (build once):Component Role Key propsScreenHeader back + title + optional search/action; optional
 title, onBack?, breadcrumb?, right?breadcrumb rowBreadcrumb tappable hierarchy trail items: {label, routeKey}[],
onNavigateSubjectCard grid tile subject, onPressClassCard full-width row cls, onPressUnitCard numbered row + description + progress; locked
 unit, index, onPressvariantLessonCard status-driven row lesson, onPressProgressBadge status pill (done/progress/todo/locked) w/ mini
 status, percent?, label?ringProgressBar / ProgressRing linear / circular progress value, max, toneEmptyState no classes/units/lessons icon, title, description, action?SkeletonCard loading row —IconTile rounded leading icon square name, tint, soft 
| <EmptyState/>
| <EmptyState/>
+ <StickyActions/>
ScreenHeader, Breadcrumb, ProgressBadge, ProgressBar, ProgressRing, EmptyState, SkeletonCard already exist as
design-system primitives — port them, don’t reinvent. SubjectCard/ClassCard/UnitCard/LessonCard are feature
components that compose those primitives.2. Folder / file structure 
src/features/learn/
screens/
SubjectsScreen.tsx
ClassesScreen.tsx
UnitsScreen.tsx
LessonsScreen.tsx
LessonDetailScreen.tsx
components/
SubjectCard.tsx
ClassCard.tsx
UnitCard.tsx
LessonCard.tsx
ClassSummaryCard.tsx // ring + counts (Units screen)
UnitSummaryCard.tsx // description + done/total (Lessons screen)
VideoPlaceholder.tsx
ConceptList.tsx
StickyActions.tsx
navigation/
LearnStack.tsx // native-stack navigator + param list
data/
learn.mock.ts // mock data (see §4) — swap for API/React-Query
learn.types.ts
src/ui/ // shared DS primitives
ScreenHeader.tsx Breadcrumb.tsx ProgressBadge.tsx ProgressBar.tsx
ProgressRing.tsx EmptyState.tsx SkeletonCard.tsx IconTile.tsx
theme/tokens.ts // ported CSS vars

If the app already has a Subjects screen, either replace it with SubjectsScreen.tsx or keep it and have its onPress navigate to
Classes — the rest of the stack is new. 
3. Navigation 
Native-stack (push/pop gives the slide + back gesture for free). Route names + params: 
// learn.types.ts
export type LearnStackParamList = {
Subjects: undefined;
Classes: { subjectId: string };
Units: { subjectId: string; classId: string };
Lessons: { subjectId: string; classId: string; unitId: string };
LessonDetail: { subjectId: string; classId: string; unitId: string; lessonId: string };
};
Pass ids only in params; each screen selects its slice from the store/query (keeps params serializable and deep-linkable).
navigation.push('Classes', { subjectId }) ... down the chain.
Breadcrumb taps call navigation.popTo-style logic: navigation.pop(n) or navigation.popToTop() for the Subjects
crumb. With expo-router use router.dismissTo/relative ../...
expo-router equivalent: app/(learn)/subjects.tsx, classes.tsx, units.tsx, lessons.tsx, lesson
[lessonId].tsx, passing ids via useLocalSearchParams.
Deep links: qadam://learn/math/g10/algebra/l4 maps cleanly to the param chain. 
4. Mock data structure 
Mirror ui_kits/mobile/lessons/data.js. Shape: 
// learn.types.ts
export type Progress = number; // 0–100
export type LessonStatus = 'locked' | 'available' | 'progress' | 'done';export interface Subject {
id: string; title: string; en: string;
icon: string; // lucide name: radical, atom, flask-conical, leaf, languages
tint: string; soft: string; // accent + soft bg (hex)
classCount: number; progress: Progress;
}
export interface ClassLevel {
id: string; subjectId: string; title: string; grade: number;
units: number; lessons: number; progress: Progress;
}
export interface Unit {
id: string; classId: string; title: string; description: string;
lessons: number; done: number; progress: Progress; locked?: boolean;
}
export interface Lesson {
id: string; unitId: string; title: string;
minutes: number; status: LessonStatus; progress: Progress;
}
export interface LessonDetail extends Lesson {
intro: string;
concepts: { icon: string; title: string; text: string }[];
steps: number; currentStep: number;
videoUrl?: string; // null → placeholder
}

// learn.mock.ts (excerpt — full set in ui_kits/mobile/lessons/data.js)
export const SUBJECTS: Subject[] = [
{ id:'math', title:'Математика', en:'Math', icon:'radical', tint:'#2F6BFF', soft:'#EEF3FF', classCount:3,{ id:'physics', title:'Физика', en:'Physics', icon:'atom', tint:'#15C7A9', soft:'#E6FBF6', classCount:3,// chem, bio (empty classes → demo empty state), eng ...
];
// CLASSES[subjectId], UNITS[`${subjectId}:${classId}`], LESSONS[`${subjectId}:${classId}:${unitId}`], LESSON_DETAIL[lessonId]

progress:46 },
progress:28 },
Include at least one empty branch (e.g. Biology → no classes), one locked unit, and lessons covering all four statuses so every state is
exercised. 
5. Component props 
ScreenHeader: { title: string; onBack?: () => void; breadcrumb?: BreadcrumbItem[]; onCrumb?: (routeKey: string) => void; right?: ReactNode }
Breadcrumb: { items: { label: string; routeKey?: string }[]; onNavigate?: (routeKey: string) => void }
SubjectCard: { subject: Subject; onPress: () => void }
ClassCard: { cls: ClassLevel; onPress: () => void }
UnitCard: { unit: Unit; index: number; onPress: () => void } // renders locked & disabled when unit.locked
LessonCard: { lesson: Lesson; onPress: () => void } // status drives leading icon/color, mini bar, disabled
ProgressBadge: { status: 'done'|'progress'|'todo'|'locked'; percent?: number; label?: string }
ProgressBar: { value: number; max?: number; tone?: 'blue'|'teal'|'amber'|'solid'; height?: number; target?: number }
ProgressRing: { value: number; max?: number; size?: number; centerValue?: ReactNode; caption?: string; tone?: 'blue'|'teal'|'amber' }
EmptyState: { icon?: ReactNode; title?: string; description?: string; action?: ReactNode }
StickyActions: { started: boolean; onPractice: () => void; onStart: () => void }

Derived strings (compute in the component, keep data clean): - Class subtitle: ${units} бөлім · ${lessons} сабақ - Lesson
meta: ${minutes} мин (+ · жалғасуда ${progress}% when in progress, · бітті when done) - Unit badge label when in
progress: ${done}/${lessons} 
6. Implementation steps 
Tokens first. Port tokens/colors.css + spacing.css into theme/tokens.ts and tailwind.config.js (colors,
radius, fonts). Fonts: Nunito 800 (display/numbers) + Onest 400/600 — both cover Cyrillic (Kazakh copy is required). Gate
render on useFonts.
Shared primitives. Build ScreenHeader, Breadcrumb, ProgressBadge, ProgressBar, ProgressRing,EmptyState, SkeletonCard, IconTile in src/ui/ from the DS .prompt.md specs. ProgressRing = react
native-svg (two circles, strokeLinecap="round", gradient via <Defs>, group rotated −90°).
Feature cards. SubjectCard, ClassCard, UnitCard, LessonCard composing the primitives. Wrap in Pressable;
press = scale 0.99 + bg-surface-tint (Reanimated, ~140ms).
Navigator. LearnStack native-stack, LearnStackParamList, header hidden (screens render their own ScreenHeader).
Screens. Each: select data by ids, show SkeletonCard list while loading, EmptyState when empty, else FlatList. Subjects
uses numColumns={2} with columnWrapperStyle={{ gap: 12 }}.
Lesson Detail. Video placeholder (brand LinearGradient + play glyph; swap for expo-av/expo-video when real URLs
exist), continue-card ring, concept list (ListItems), sticky bottom action bar (position:absolute bottom + SafeArea
inset; content gets bottom padding so it isn’t covered).
States. Locked units/lessons: reduced opacity, lock glyph, disabled (no onPress). Completed: green check + done badge. In
progress: mini ProgressBar + %.
Wire real data later: replace learn.mock.ts selectors with React-Query hooks (useSubjects, useClasses(subjectId),
...) — component props don’t change. 
Responsive / mobile layout notes 
Single column, ~16px screen gutters, ~14px gap between cards. Subjects grid is 2-col with a 12px gap.
Use FlatList (not map in a ScrollView) for the class/unit/lesson lists — they can grow long.
Text length (KK/RU/EN): cards must not break — titles numberOfLines={2}, breadcrumb labels numberOfLines={1} with
flexShrink, ellipsize. Never fix card heights to the title; let them grow. Kazakh runs ~20% longer than English.
Tap targets ≥ 44px (rows are ~64px; the header back button is 44px).
Sticky action bar must respect useSafeAreaInsets().bottom; add matching bottom padding to the detail scroll content.
Sticky header (title + breadcrumb) stays pinned; the list scrolls under it.
Honor prefers-reduced-motion / AccessibilityInfo.isReduceMotionEnabled() — skip the press-scale and
skeleton shimmer. 
Styling tokens (quick reference — full set in tokens/) 
Spacing (4px grid): screen gutter 16, card padding 16–20, card gap 14, grid gap 12.
Radius: card 20 (--radius-lg), icon tile 16 (--radius-md), leading tile 12 (--radius-sm), pill 999.
Font sizes: screen title (Nunito 800) 24; card title (Onest 600) 16; description/meta 13; eyebrow 11 uppercase +tracking; detail
H1 32.
Colors: primary #2F6BFF; soft #EEF3FF; ink-900 #0E1526 (titles), ink-500 #64708C (muted), ink-300 #A7B0C4 (placeholder
locked); app bg #F5F7FC; card #FFFFFF; border #E6EAF2; success #16B364; subject accents per SUBJECTS.
Shadows (blue-tinted, soft): card 0 2px 8px rgba(20,48,111,.06) → iOS shadowColor:'#14306F' / Android
elevation:2. CTA lift uses #2F6BFF @ 0.28.
Status colors: done → success-500 on success-50; in-progress/available → blue-600 on blue-50; locked → ink-500 on surface
sunken #EDF0F7. 
Assumptions 
Expo + native-stack + NativeWind v4 + react-native-svg + TypeScript. If your app uses bare RN, React Navigation without
expo-router, StyleSheet instead of NativeWind, or a different icon lib, tell me and I’ll retarget.
The existing Subjects screen can be replaced or kept as the stack entry.
Kazakh copy throughout (matches the app); wire i18n (i18next) for RU/EN — the layouts already tolerate longer strings.
Progress/lock/status come from the API in production; mock data models the exact shape so the swap is drop-in.
Video is a placeholder until real content URLs exist (videoUrl on LessonDetail).
Icons are Lucide (lucide-react-native), matching the design system. ```