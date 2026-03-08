/**
 * Supported languages - add new languages here for scalability
 * Note: Keep in sync with shared/i18n/constants.js
 */
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
  he: {
    code: 'he',
    name: 'עברית',
    dir: 'rtl',
    flag: '🇮🇱',
  },
};

export const LANGUAGE_STORAGE_KEY = 'flukee_lang';
