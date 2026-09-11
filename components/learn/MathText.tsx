import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

// Module-level so these prop identities never change between renders. Every
// prop update on the WebView reloads the page (see the note in MathText), so
// the component must hand it the exact same objects on every render.
const ORIGIN_WHITELIST = ['*'];
const WEBVIEW_STYLE = { flex: 1, backgroundColor: 'transparent' } as const;

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

/**
 * The page shell. Deliberately free of the text it will display: the shell is
 * loaded once per MathText instance and the prompt is pushed in afterwards with
 * `window.setContent`, so changing question never reloads the page.
 */
function buildShell(fontSize: number, color: string, bold: boolean): string {
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

  // Swap the displayed text in place. Assigning textContent first keeps LaTeX
  // backslashes and HTML-special chars untouched; KaTeX then renders the
  // delimited spans. Called by RN on mount and on every later value change.
  window.setContent = function (text) {
    el.textContent = text;
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
    report('ready');
  };

  function boot() {
    // Report reflows that happen after the initial render (web fonts landing,
    // a formula wrapping differently). Registered once, not per content swap.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { report('height'); });
    }
    if (window.ResizeObserver) {
      new ResizeObserver(function () { report('height'); }).observe(el);
    }
    post('shell-ready', measure());
  }

  if (window.renderMathInElement) boot();
  else {
    window.addEventListener('load', boot);
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
 *
 * Every prop update reloads this WebView, and a reload blanks the text and
 * re-fetches KaTeX. That made the naive shape — HTML rebuilt from `value`,
 * inline `style`, height pushed back from the page — flicker forever: the page
 * reported its plain-text height, the re-render reloaded it, it reported its
 * rendered height, and round it went. So the WebView's props are frozen after
 * mount: a constant `style`, a `source` that depends only on the typography,
 * and a stable `onMessage`. Height and fade live on the wrapper View, and new
 * text is injected rather than re-sourced.
 */
export function MathText({
  value,
  fontSize = 15,
  color = '#0E1526',
  bold = false,
  plainClassName,
}: MathTextProps) {
  // Height of the same string laid out by RN as ordinary text. It is available
  // on the first layout pass, long before the WebView can report anything, and
  // it is close to the final rendered height because it's the same words at the
  // same size. Without it the row starts one line tall and leaps to full height
  // when KaTeX reports — which shifts every card below it, so anything the
  // reader was aiming at moves out from under their finger.
  const [plainHeight, setPlainHeight] = useState(0);
  const [webHeight, setWebHeight] = useState(0);
  const [ready, setReady] = useState(false);
  // Set if KaTeX can't load — render the raw string as plain text instead.
  const [failed, setFailed] = useState(false);
  const [shellReady, setShellReady] = useState(false);
  const webRef = useRef<WebView>(null);

  const isMath = useMemo(() => hasMath(value), [value]);
  const shell = useMemo(
    () => (isMath ? buildShell(fontSize, color, bold) : ''),
    [isMath, fontSize, color, bold]
  );
  const source = useMemo(() => ({ html: shell }), [shell]);

  // Push the text in once the shell is up, and again whenever it changes. This
  // is what makes moving to the next question cheap: no reload, no CDN round
  // trip, no blank frame — just a textContent swap and a re-measure.
  useEffect(() => {
    if (!shellReady) return;
    webRef.current?.injectJavaScript(`window.setContent(${JSON.stringify(value)}); true;`);
  }, [value, shellReady]);

  // Ignore sub-pixel re-measurements so a reflow that changes nothing visible
  // doesn't churn the layout.
  const applyHeight = useCallback((next: number) => {
    setWebHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
  }, []);

  // Never shrink below the plain-text height: KaTeX only ever needs the same
  // room or a little more, and taking the max means the row can grow slightly
  // once but never collapse and re-expand.
  const height = Math.max(plainHeight, webHeight) || Math.ceil(fontSize * 1.45);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data) as { type: string; height: number };
        if (msg.type === 'fallback') {
          setFailed(true);
          return;
        }
        if (Number.isFinite(msg.height) && msg.height > 0) applyHeight(msg.height);
        if (msg.type === 'shell-ready') {
          setShellReady(true);
          return;
        }
        if (msg.type === 'ready' || msg.type === 'height') setReady(true);
      } catch {
        // ignore malformed messages
      }
    },
    [applyHeight]
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
    // Height and the fade-in live here, on a plain RN View, so they never touch
    // the WebView's props.
    <View pointerEvents="none" style={{ height, width: '100%' }}>
      {/*
        Absolutely positioned so it measures without driving layout. It doubles
        as what the reader sees while KaTeX is still loading — the raw `$…$` is
        less pretty than the rendered math but it beats a blank gap, and it sits
        at the same size, so the swap to the rendered version barely moves.
      */}
      <Text
        onLayout={(e) => setPlainHeight(Math.ceil(e.nativeEvent.layout.height))}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          fontSize,
          color,
          lineHeight: Math.ceil(fontSize * 1.45),
          fontWeight: bold ? '700' : '400',
          opacity: ready ? 0 : 1,
        }}>
        {value}
      </Text>
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height, opacity: ready ? 1 : 0 }}>
        <WebView
          ref={webRef}
          originWhitelist={ORIGIN_WHITELIST}
          source={source}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={WEBVIEW_STYLE}
          onMessage={onMessage}
        />
      </View>
    </View>
  );
}
