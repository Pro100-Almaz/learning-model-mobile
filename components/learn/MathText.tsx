import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  /** Text that may contain inline `$...$` or block `$$...$$` LaTeX. */
  value: string;
  /** Font size in px, applied to both the plain and rendered paths. */
  fontSize?: number;
  /** Text color (hex). */
  color?: string;
  bold?: boolean;
  /** NativeWind class for the plain-text fast path (no math present). */
  plainClassName?: string;
}

// KaTeX from jsDelivr — the app already relies on network for its content, and
// this keeps the JS bundle small. `renderMathInElement` scans for the standard
// $…$ / $$…$$ delimiters.
const KATEX_VERSION = '0.16.11';
const KATEX_BASE = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist`;

function hasMath(text: string): boolean {
  return text.includes('$');
}

function buildHtml(value: string, fontSize: number, color: string, bold: boolean): string {
  // Embed the raw string as a JS literal and set it via textContent so LaTeX
  // backslashes and HTML-special chars survive untouched; KaTeX then renders
  // the delimited spans in place.
  const payload = JSON.stringify(value);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${KATEX_BASE}/katex.min.css" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; -webkit-text-size-adjust: 100%; }
  #c {
    font-family: -apple-system, Roboto, system-ui, sans-serif;
    font-size: ${fontSize}px;
    line-height: 1.45;
    font-weight: ${bold ? 700 : 400};
    color: ${color};
    overflow-wrap: break-word;
    -webkit-font-smoothing: antialiased;
  }
  /* Let a very wide formula scroll horizontally instead of forcing tall reflow. */
  .katex-display { margin: 0; overflow-x: auto; overflow-y: hidden; }
</style>
</head>
<body>
<div id="c"></div>
<script src="${KATEX_BASE}/katex.min.js"></script>
<script src="${KATEX_BASE}/contrib/auto-render.min.js"></script>
<script>
  var el = document.getElementById('c');
  el.textContent = ${payload};

  function post(type, height) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, height: height }));
    }
  }
  function measure() {
    // Round up to avoid clipping the last line by a sub-pixel.
    return Math.ceil(el.getBoundingClientRect().height) + 1;
  }
  function report(type) { post(type || 'height', measure()); }

  function run() {
    if (!window.renderMathInElement) {
      // KaTeX failed to load (e.g. offline) — tell RN to fall back to plain text.
      post('fallback', measure());
      return;
    }
    try {
      renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    } catch (e) {}

    // Report now, again after web-fonts settle, and on any later reflow.
    report('ready');
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { report('height'); });
    }
    if (window.ResizeObserver) {
      new ResizeObserver(function () { report('height'); }).observe(el);
    }
    setTimeout(function () { report('height'); }, 300);
  }

  if (window.renderMathInElement) run();
  else {
    window.addEventListener('load', run);
    // If scripts never arrive, give up and fall back after a short grace period.
    setTimeout(function () { if (!window.renderMathInElement) post('fallback', measure()); }, 4000);
  }
</script>
</body>
</html>`;
}

/**
 * Renders text that may contain LaTeX. Strings without a `$` render as a normal
 * RN <Text> (cheap, styleable via `plainClassName`); strings with math render
 * in a transparent, auto-height WebView backed by KaTeX.
 *
 * The WebView is wrapped with `pointerEvents="none"` so it's purely display —
 * vertical drags reach the parent ScrollView and taps reach the option row,
 * rather than being swallowed by the web content.
 */
export function MathText({
  value,
  fontSize = 15,
  color = '#0E1526',
  bold = false,
  plainClassName,
}: MathTextProps) {
  const [height, setHeight] = useState(Math.ceil(fontSize * 1.45));
  const [ready, setReady] = useState(false);
  // Set if KaTeX can't load — render the raw string as plain text instead.
  const [failed, setFailed] = useState(false);

  const isMath = useMemo(() => hasMath(value), [value]);
  const html = useMemo(
    () => (isMath ? buildHtml(value, fontSize, color, bold) : ''),
    [isMath, value, fontSize, color, bold]
  );

  const plain = !isMath || failed;
  if (plain) {
    return (
      <Text
        className={plainClassName}
        style={plainClassName ? undefined : { fontSize, color, fontWeight: bold ? '700' : '400' }}>
        {value}
      </Text>
    );
  }

  return (
    <View pointerEvents="none" style={{ height, width: '100%' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Transparent so the card/background shows through; fade in once laid
        // out to avoid a flash of clipped/unstyled content.
        style={{ backgroundColor: 'transparent', height, opacity: ready ? 1 : 0 }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data) as { type: string; height: number };
            if (msg.type === 'fallback') {
              setFailed(true);
              return;
            }
            if (Number.isFinite(msg.height) && msg.height > 0) setHeight(msg.height);
            if (msg.type === 'ready' || msg.type === 'height') setReady(true);
          } catch {
            // ignore malformed messages
          }
        }}
      />
    </View>
  );
}
