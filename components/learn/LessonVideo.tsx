import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView, type WebViewProps } from 'react-native-webview';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { isEmbedNavigation, type VideoProvider } from '@/lib/learn';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

interface LessonVideoProps {
  /** A player embed URL from `videoEmbedUrl` (youtube-nocookie / player.vimeo). */
  embedUrl: string;
  provider: VideoProvider;
  /** Custom poster from `videoThumbnail`; when absent the embed shows its own. */
  poster?: string | null;
}

/**
 * Wrap the embed in a minimal HTML page. Loading the player as a bare `uri`
 * gives it no document origin, so YouTube refuses playback (error 150/153). An
 * HTML doc with a real `baseUrl` (below) supplies that origin and the player works.
 */
function playerHtml(src: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; background: #000; overflow: hidden; }
      .frame { position: absolute; inset: 0; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <div class="frame">
      <iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
  </body>
</html>`;
}

/**
 * Inline 16:9 YouTube/Vimeo player.
 *
 * When a `poster` exists we show a *facade* first — our own thumbnail + play
 * button — and only mount the WebView on tap (with autoplay). This avoids
 * loading the provider iframe (and its branding) until the student plays, and
 * keeps the pre-play UI on-brand. Without a poster we mount the WebView
 * directly and let the embed show its own poster frame.
 *
 * Either way the video can never navigate to the source site: the WebView is
 * pinned to the embed origin. Any request that isn't the embed itself — the
 * "Watch on YouTube" link, the logo/channel tap, an app deep-link — is rejected
 * by `onShouldStartLoadWithRequest`, and `target="_blank"` pop-ups are refused
 * via `setSupportMultipleWindows={false}`. A redirecting tap simply does nothing.
 */
export function LessonVideo({ embedUrl, provider, poster }: LessonVideoProps) {
  // With a facade the student taps the poster (a user gesture), so we can
  // autoplay; without one the WebView must wait for a tap on the embed itself.
  const [playing, setPlaying] = useState(!poster);

  const onShouldStartLoadWithRequest = useCallback<
    NonNullable<WebViewProps['onShouldStartLoadWithRequest']>
  >((req) => isEmbedNavigation(req.url, provider), [provider]);

  const src = poster ? `${embedUrl}&autoplay=1` : embedUrl;

  return (
    <View
      style={SHADOW_SOFT}
      className="aspect-video overflow-hidden rounded-lg bg-black">
      {playing ? (
        <WebView
          // baseUrl = the embed URL so the page has a valid origin (fixes error 153).
          source={{ html: playerHtml(src), baseUrl: embedUrl }}
          style={{ flex: 1, backgroundColor: '#000' }}
          // Keep the player from ever leaving its own origin.
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          setSupportMultipleWindows={false}
          onOpenWindow={() => {}}
          originWhitelist={['*']}
          // Playback / rendering.
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          // A facade tap is the gesture, so autoplay is allowed; otherwise gate it.
          mediaPlaybackRequiresUserAction={!poster}
          allowsFullscreenVideo={false}
          allowsBackForwardNavigationGestures={false}
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center bg-black">
              <ActivityIndicator color={COLORS.blue400} />
            </View>
          )}
          startInLoadingState
        />
      ) : (
        <PressableScale
          activeScale={0.99}
          accessibilityRole="button"
          accessibilityLabel="Видеоны ойнату"
          onPress={() => setPlaying(true)}
          className="flex-1 items-center justify-center">
          <Image
            source={{ uri: poster! }}
            resizeMode="cover"
            className="absolute inset-0 h-full w-full"
          />
          {/* Scrim so the play button reads over any poster. */}
          <View className="absolute inset-0 bg-black/25" />
          <View className="h-16 w-16 items-center justify-center rounded-pill bg-white/95">
            <Ionicons name="play" size={30} color={COLORS.blue600} style={{ marginLeft: 3 }} />
          </View>
        </PressableScale>
      )}
    </View>
  );
}
