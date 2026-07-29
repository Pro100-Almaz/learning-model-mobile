import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { MMKV } from 'react-native-mmkv';

import en from './locales/en.json';
import kk from './locales/kk.json';
import ru from './locales/ru.json';

export const SUPPORTED_LANGUAGES = ['kk', 'ru', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  kk: 'Қазақша',
  ru: 'Русский',
  en: 'English',
};

const STORAGE_KEY = 'app.language';

/**
 * Persist the chosen language. MMKV is JSI-based and unavailable on web (and in
 * some test environments), so we guard construction and every access, falling
 * back to an in-memory value. The language still works for the session; only
 * cross-restart persistence is lost when storage is unavailable.
 */
const storage = (() => {
  try {
    return new MMKV({ id: 'i18n' });
  } catch {
    return null;
  }
})();

let memoryLanguage: string | undefined;

const readStored = (): string | undefined => {
  try {
    return storage?.getString(STORAGE_KEY) ?? memoryLanguage;
  } catch {
    return memoryLanguage;
  }
};

const writeStored = (lang: string) => {
  memoryLanguage = lang;
  try {
    storage?.set(STORAGE_KEY, lang);
  } catch {
    // Ignore — the in-memory value keeps the session consistent.
  }
};

const resources = {
  en: { translation: en },
  kk: { translation: kk },
  ru: { translation: ru },
} as const;

const isSupported = (lang: string | undefined | null): lang is AppLanguage =>
  !!lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);

/**
 * Resolve the initial language:
 * 1. A previously saved user choice (MMKV), else
 * 2. The device locale if it's one we support, else
 * 3. Kazakh (the app's primary language).
 */
const resolveInitialLanguage = (): AppLanguage => {
  const saved = readStored();
  if (isSupported(saved)) return saved;

  const deviceLang = getLocales()?.[0]?.languageCode;
  if (isSupported(deviceLang)) return deviceLang;

  return 'kk';
};

export const persistLanguage = (lang: AppLanguage) => {
  writeStored(lang);
};

export const getStoredLanguage = (): AppLanguage | undefined => {
  const saved = readStored();
  return isSupported(saved) ? saved : undefined;
};

i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLanguage(),
  fallbackLng: 'kk',
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
