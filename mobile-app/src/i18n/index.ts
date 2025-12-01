import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'intl-pluralrules';

import en from './en.json';
import he from './he.json';

const RESOURCES = {
  en: { translation: en },
  he: { translation: he },
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem('user-language');
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }
    } catch (error) {
      console.log('Error reading language', error);
    }
    // Default to Hebrew as requested if detection fails or first time
    callback('he');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
        console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    // @ts-ignore
    compatibilityJSON: 'v3',
    resources: RESOURCES,
    fallbackLng: 'he',
    // @ts-ignore
    interpolation: {
      escapeValue: false,
    },
    react: {
        useSuspense: false,
    }
  });

export default i18n;
