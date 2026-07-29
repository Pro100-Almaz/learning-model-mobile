import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import i18n, {
  AppLanguage,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  persistLanguage,
} from './index';

/**
 * Convenience hook for reading and switching the active UI language.
 * Persists the choice so it survives app restarts.
 */
export const useLanguage = () => {
  // Subscribe to language changes so consumers re-render on switch.
  const { i18n: instance } = useTranslation();

  const language = instance.language as AppLanguage;

  const setLanguage = useCallback((lang: AppLanguage) => {
    persistLanguage(lang);
    return i18n.changeLanguage(lang);
  }, []);

  return {
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    labels: LANGUAGE_LABELS,
  };
};
