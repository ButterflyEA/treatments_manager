import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    // Update document direction for Hebrew
    document.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  return (
    <div className="language-switcher">
      <label>{t('language')}:</label>
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">{t('english')}</option>
        <option value="he">{t('hebrew')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
