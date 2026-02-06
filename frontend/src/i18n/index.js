import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enGovernor from './locales/en/governor.json';
import enBuild from './locales/en/build.json';
import enEquipment from './locales/en/equipment.json';
import enProfile from './locales/en/profile.json';
import enAdmin from './locales/en/admin.json';

// Import Japanese translations
import jaCommon from './locales/ja/common.json';
import jaAuth from './locales/ja/auth.json';
import jaDashboard from './locales/ja/dashboard.json';
import jaGovernor from './locales/ja/governor.json';
import jaBuild from './locales/ja/build.json';
import jaEquipment from './locales/ja/equipment.json';
import jaProfile from './locales/ja/profile.json';
import jaAdmin from './locales/ja/admin.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    governor: enGovernor,
    build: enBuild,
    equipment: enEquipment,
    profile: enProfile,
    admin: enAdmin,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    dashboard: jaDashboard,
    governor: jaGovernor,
    build: jaBuild,
    equipment: jaEquipment,
    profile: jaProfile,
    admin: jaAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'governor', 'build', 'equipment', 'profile', 'admin'],

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
