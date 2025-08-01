import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    updateDocumentDirection(language);
  };

  const updateDocumentDirection = (language) => {
    // Update document direction for Hebrew
    const isRTL = language === 'he';
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add class to body for additional styling hooks
    document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '');
    document.body.classList.add(isRTL ? 'rtl' : 'ltr');
  };

  // Initialize direction on component mount
  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language]);

  return (
    <div className="language-switcher">
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
