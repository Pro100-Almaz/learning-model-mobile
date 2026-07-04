Qadam Onboarding — Claude Code Handoff (React Native /
Expo) 
A 4-step, Stories-like onboarding with an orbital page transition. Content orbits; the Prev/Next bar is fixed. Preview: ui_kits
mobile/Onboarding.html. 
Stack assumed: Expo SDK 50+, react-native-reanimated v3, nativewind v4, TypeScript. 
1. Component structure 
<OnboardingScreen> // owns step index + form state, renders fixed chrome
├─ <StoryProgress current step={i}/> // top segmented story bars (fixed)
├─ <OrbitStage index={i}> // the rotating orbit; ONLY this animates
│ ├─ <OrbitFace pos={0}><WelcomeStep/></OrbitFace>
│ ├─ <OrbitFace pos={1}><ProfileStep value onChange/></OrbitFace>
│ ├─ <OrbitFace pos={2}><ScoreStep kind="expected" .../></OrbitFace>
│ └─ <OrbitFace pos={3}><ScoreStep kind="target" .../></OrbitFace>
└─ <NavBar> // FIXED, never inside OrbitStage
├─ <PrevButton hidden={i===0}/>
└─ <PrimaryButton label={i===last ? 'Бастау' : 'Жалғастыру'}/>

Leaf/shared components: WelcomeStep, ProfileStep, ScoreStep, Chip, LabeledInput, ScoreSlider, PrimaryButton,
PrevButton, StoryProgress, OrbitStage, OrbitFace. 
ScoreStep is reused for Page 3 (expected) and Page 4 (target) — same layout, different kind/accent so they feel connected but
distinct. 
2. Suggested file paths 
src/features/onboarding/
OnboardingScreen.tsxorbit/
OrbitStage.tsxOrbitFace.tsxsteps/
WelcomeStep.tsx
ProfileStep.tsx
ScoreStep.tsx
components/
StoryProgress.tsx
ScoreSlider.tsx
Chip.tsx
LabeledInput.tsx
onboarding.types.ts
useOnboarding.tstheme/tokens.ts
// container + state + nav
// Reanimated cube/orbit driver
// one positioned face
// state hook (see §5)
// port of the design-system CSS vars
Route: app/(onboarding)/index.tsx (expo-router) → renders <OnboardingScreen/>. 
3. Animation approach (orbital) 
The 4 pages are faces of a vertical-axis carousel/cube. Advancing rotates the whole ring by one 90° step — one animated transform
on one node, so faces never race and can’t tear. This mirrors the HTML (.ob-ring + .ob-face). 
Shared value: const angle = useSharedValue(0) (target degrees = -index * 90).
On step change: angle.value = withTiming(-index * 90, { duration: 520, easing:
Easing.bezier(0.22, 1, 0.36, 1) }) — the design system’s --ease-soft. (Use withSpring({ damping: 18,
stiffness: 90 }) for a softer, premium settle.)
Stage needs perspective: wrap in a view with style={{ transform: [{ perspective: 1500 }] }}.Ring animated style: ts useAnimatedStyle(() => ({ transform: [{ translateZ: -R }, { rotateY: `
{angle.value}deg` }], })) // R = screenWidth / 2 
Each face static transform: [{ rotateY:${pos*90}deg}, { translateZ: R }], backfaceVisibility: 'hidden'.
Occlusion: faces are opaque (paint the app background on each) so the front face hides the rest; also cull faces more than one
step away (opacity: Math.abs(pos-index) <= 1 ? 1 : 0) — they’re edge-on when they swing in, so there’s no pop.
Set pointerEvents="none" on non-active faces.
Buttons live outside OrbitStage in the fixed NavBar, so they don’t move.
StoryProgress fills bar i on step change with a 300ms width timing. 
Reanimated caveat: translateZ / rotateY + backfaceVisibility are supported on both platforms but 3D culling
is less reliable on Android — the opacity-cull above is what makes it robust. If you want zero 3D risk, the fallback is a
horizontal translateX(-index * width) track with a subtle rotateY easing; keep the same component tree. 
4. NativeWind classes 
Add the tokens to tailwind.config.js first (port from tokens/colors.css / spacing.css): 
// tailwind.config.js → theme.extend
colors: {
blue: { 50:'#EEF3FF',100:'#DCE6FF',200:'#BBCEFF',400:'#5C86FF',500:'#2F6BFF',600:'#1E54E8',700:'#1A45BE'teal: { 500:'#15C7A9' }, amber: { 500:'#FFB020' },
ink: { 900:'#0E1526',700:'#33405C',500:'#64708C',300:'#A7B0C4' },
surface: { app:'#F5F7FC', tint:'#EEF3FF', field:'#EDF0F7' },
line: { 200:'#E6EAF2', 300:'#D7DDEA' },
},
borderRadius: { md:'16px', lg:'20px', xl:'28px', pill:'999px' },
fontFamily: { display:['Nunito_800ExtraBold'], body:['Onest_400Regular'], bodyBold:['Onest_600SemiBold']
},
},
Representative classes: 
Screen root: flex-1 bg-surface-app
Story progress track / fill: h-1 flex-1 rounded-pill bg-blue-500/20 · fill h-full rounded-pill bg-blue-500
OrbitFace: absolute inset-0 px-7 pt-4 bg-surface-app (opaque)
Eyebrow: text-[11px] font-bodyBold tracking-[1.5px] uppercase text-blue-500 mb-2.5
H1: font-display text-[30px] leading-tight text-ink-900 mb-3
Sub: font-body text-base leading-6 text-ink-500
LabeledInput well: flex-row items-center gap-2.5 h-[52px] px-4 rounded-md bg-surface-field · label
text-sm font-bodyBold text-ink-900 mb-1.5
Chip: base px-4 py-2.5 rounded-pill border border-line-200 bg-white text-sm font-bodyBold text
ink-700 · selected bg-blue-500 border-blue-500 text-white
Score value: font-display text-[64px] leading-none text-ink-900 (target step: text-blue-500)
PrimaryButton: h-14 rounded-md bg-blue-500 items-center justify-center flex-row gap-2 + shadow (see
notes) · label text-white font-bodyBold text-lg
PrevButton: w-13 h-13 rounded-md bg-white/70 items-center justify-center (hidden on step 0)
NavBar: flex-row items-center gap-3.5 px-7 pt-2.5 pb-6 
Press feedback: wrap buttons in Pressable and scale to 0.96 via Reanimated (--ease-soft, ~140ms) instead of active:
classes. 
5. State shape 
// onboarding.types.ts
export interface OnboardingData {
university: string; // Page 2
major: string; // Page 2
expectedScore: number; // Page 3 (UNT scale 40–140)
targetScore: number; // Page 4 (>= expectedScore, enforced softly)
}
export interface OnboardingState {
step: number; // 0..3, drives the orbit angle
data: OnboardingData;
}export const INITIAL: OnboardingState = {
step: 0,
data: { university: '', major: '', expectedScore: 105, targetScore: 120 },
};

// useOnboarding.ts
export function useOnboarding() {
const [step, setStep] = useState(0);
const [data, setData] = useState(INITIAL.data);
const LAST = 3;
 const set = (patch: Partial<OnboardingData>) => setData(d => ({ ...d, ...patch }));
const next = () => (step < LAST ? setStep(s => s + 1) : finish());
const prev = () => setStep(s => Math.max(0, s - 1));
 // gate Next per step
const canAdvance =
step === 1 ? !!data.university && !!data.major : true;
 const finish = () => {/* persist + navigate to app */};
return { step, data, set, next, prev, canAdvance, isLast: step === LAST };
}

Persist on finish (e.g. AsyncStorage.setItem('qadam.onboarding', JSON.stringify(data))) then route into the app. 
6. Implementationnotes for Claude Code 
Fonts: @expo-google-fonts/nunito (800) + @expo-google-fonts/onest (400/600/800). Both cover Cyrillic —
required; UI copy is Kazakh. Load via useFonts and gate render on fontsLoaded.
Keep NavBar out of the orbit. It’s a sibling of OrbitStage, absolutely pinned to the bottom with SafeAreaView bottom
inset. Never place it inside a rotating/animated parent.
Score inputs: use @react-native-community/slider (or a Reanimated custom track for the exact look — thumb = white,
5px blue-500 border, shadow-md). Provide quick-pick chips (90/105/120/135) that set the value. Target step: soft-clamp
targetScore >= expectedScore.
ProfileStep: the “quick” chips are shortcuts that fill the input; real build should back the input with a searchable university
major list (FlatList in a bottom sheet). Placeholder chips in the preview are illustrative.
Shadows: iOS shadowColor:'#14306F', shadowOpacity:0.10, shadowRadius:12, shadowOffset:{h:6};
Android elevation: 6. Blue CTA lift: shadowColor:'#2F6BFF', shadowOpacity:0.28, shadowRadius:14.
Gradients: brand hero + backgrounds use expo-linear-gradient. Brand: #2F6BFF→#5C86FF→#7C5CFF (135°). App bg
radial ≈ #DCE8FF→#F5F7FC; approximate with a top-anchored LinearGradient.
Progress ring on the finish screen: react-native-svg <Circle> with strokeDasharray + strokeLinecap="round",
gradient stroke via <Defs><LinearGradient/>.
Reduced motion: if AccessibilityInfo.isReduceMotionEnabled(), drop the rotation to a cross-fade (opacity
timing) — same tree, skip the rotateY.
Reanimated setup: add 'react-native-reanimated/plugin' last in babel.config.js. Guard against re-running the
timing when step hasn’t changed.
RTL/length: Kazakh strings are longer than English — use numberOfLines + adjustsFontSizeToFit on the H1, and
flex-wrap on chip rows.
Design source of truth: colors/spacing/radii/type come from this design system (styles.css + tokens/). Don’t hardcode
new values — port the tokens into theme/tokens.ts and tailwind.config.js so the app stays on-brand.