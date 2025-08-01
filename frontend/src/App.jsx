import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PatientManager from './components/PatientManager'
import './App.css'

function App() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Set initial document direction based on language
    const updateDirection = () => {
      document.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
      document.title = t('pageTitle');
    };

    updateDirection();
    
    // Listen for language changes
    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n, t]);

  return (
    <div className="App">
      <PatientManager />
    </div>
  )
}

export default App
