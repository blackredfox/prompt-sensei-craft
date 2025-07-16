import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      zh: { translation: zh },
      ar: { translation: ar }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;