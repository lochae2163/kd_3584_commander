import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  // Get current language, handling variants like 'en-US' -> 'en'
  const currentLang = i18n.language?.split('-')[0] || 'en';

  return (
    <div className="language-switcher">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${currentLang === lang.code ? 'active' : ''}`}
          onClick={() => handleLanguageChange(lang.code)}
          title={lang.label}
        >
          <span className="lang-flag">{lang.flag}</span>
          <span className="lang-code">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
