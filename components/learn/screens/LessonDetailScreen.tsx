import { ScrollView, Text, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SHADOW_SOFT } from "@/lib/onboarding-theme";
import {
  lessonDetailMeta,
  videoEmbedUrl,
  videoThumbnail,
  type LessonDetail,
} from "@/lib/learn";
import { type BreadcrumbItem } from "../Breadcrumb";
import { LessonVideo } from "../LessonVideo";
import { TagList } from "../TagList";
import { ProgressRing } from "../ProgressRing";
import { ScreenHeader } from "../ScreenHeader";
import { StickyActions } from "../StickyActions";
import { VideoPlaceholder } from "../VideoPlaceholder";

interface LessonDetailScreenProps {
  lesson: LessonDetail;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onTest: () => void;
}

/**
 * Lesson detail: eyebrow + title + meta, video, continue card (if started),
 * summary, key concepts and a sticky action bar. See docs/subject_lesson_pages.md §1, §6.
 */
export function LessonDetailScreen({
  lesson,
  breadcrumb,
  onBack,
  onCrumb,
  onTest,
}: LessonDetailScreenProps) {
  const embedUrl = videoEmbedUrl(lesson.videoUrl, lesson.provider);
  const poster = videoThumbnail(lesson.videoUrl, lesson.provider);
  const tabBarHeight = useBottomTabBarHeight();
  const reduceMotion = useReducedMotion();
  const started = lesson.progress > 0;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader
          title={lesson.title}
          onBack={onBack}
          breadcrumb={breadcrumb}
          onCrumb={onCrumb}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: tabBarHeight + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-600">
            Сабақ
          </Text>
          <Text className="font-display text-[28px] leading-tight text-ink-900">
            {lesson.title}
          </Text>
          <Text className="text-[13px] text-ink-500">
            {lessonDetailMeta(lesson)}
          </Text>
        </View>

        {embedUrl ? (
          <LessonVideo
            embedUrl={embedUrl}
            provider={lesson.provider}
            poster={poster}
          />
        ) : (
          <VideoPlaceholder videoUrl={lesson.videoUrl} />
        )}

        {started ? (
          <View
            style={SHADOW_SOFT}
            className="flex-row items-center gap-4 rounded-lg bg-white p-4"
          >
            <ProgressRing
              value={lesson.progress}
              size={72}
              stroke={8}
              reduceMotion={reduceMotion}
              centerValue={
                <Text className="font-display text-[16px] text-ink-900">
                  {lesson.progress}%
                </Text>
              }
            />
            <View className="flex-1 gap-0.5">
              <Text className="font-bodyBold text-base text-ink-900">
                Жалғастыруға дайынсың
              </Text>
              <Text className="text-[13px] text-ink-500">
                {lesson.progress}% аяқталды
              </Text>
            </View>
          </View>
        ) : null}

        <View className="gap-2">
          <Text className="font-display text-xl text-ink-900">Қысқаша</Text>
          <Text className="text-[14px] leading-6 text-ink-700">
            {lesson.description}
          </Text>
        </View>

        {lesson.tags.length > 0 ? (
          <View className="gap-2">
            <Text className="font-display text-xl text-ink-900">
              Негізгі ұғымдар
            </Text>
            <TagList tags={lesson.tags} />
          </View>
        ) : null}
      </ScrollView>

      <StickyActions onTest={onTest} />
    </View>
  );
}
