import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import en from './locales/en.json';
import he from './locales/he.json';
import { LANGUAGE_STORAGE_KEY } from './constants';

const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getDeviceLanguage = () => {
  try {
    const Localization = require('expo-localization');
    const locales = Localization.getLocales?.() || [];
    const lang = locales?.[0]?.languageCode?.split('-')[0];
    return lang === 'he' ? 'he' : 'en';
  } catch {
    return 'en';
  }
};

const applyRTL = (isRTL) => {
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }
};

export const initI18n = async () => {
  const stored = await getStoredLanguage();
  const initialLang = stored && (stored === 'en' || stored === 'he')
    ? stored
    : getDeviceLanguage();

  applyRTL(initialLang === 'he');

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  i18n.on('languageChanged', async (lng) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch {}
    const isRTL = lng === 'he';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
      // RTL change requires app restart to take effect (expo-updates not in use)
    }
  });

  return i18n;
};

export default i18n;
