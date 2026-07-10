import { useEffect, useState } from 'react';

/**
 * Simulates a short async fetch so the learn screens exercise their skeleton
 * states while the data source is still mock/synchronous. Swap the screens'
 * selectors for React-Query later and drop this. See docs/subject_lesson_pages.md.
 */
export function useMockLoading(delay = 400): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return loading;
}
