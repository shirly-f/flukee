import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from 'shared/i18n/locales/en.json';
import he from 'shared/i18n/locales/he.json';
import { LANGUAGE_STORAGE_KEY } from 'shared/i18n/constants';

const getStoredLanguage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LANGUAGE_STORAGE_KEY);
};

const getDeviceLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0];
  return lang === 'he' ? 'he' : 'en';
};

const getInitialLanguage = (): string => {
  const stored = getStoredLanguage();
  if (stored && (stored === 'en' || stored === 'he')) return stored;
  return getDeviceLanguage();
};

const initialLang = getInitialLanguage();

const updateDocumentDirection = (lng: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  document.documentElement.style.transition = 'none';
  requestAnimationFrame(() => {
    document.documentElement.style.transition = '';
  });
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: initialLang,
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
});

updateDocumentDirection(initialLang);

/** Base tab title only. Role-specific suffix is set from AuthContext when logged in. */
export const applyBaseDocumentTitle = () => {
  if (typeof document !== 'undefined') {
    document.title = i18n.t('login.title');
  }
};

applyBaseDocumentTitle();

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }
  updateDocumentDirection(lng);
  applyBaseDocumentTitle();
  window.dispatchEvent(new CustomEvent('flukee:languageChanged'));
});

export default i18n;
